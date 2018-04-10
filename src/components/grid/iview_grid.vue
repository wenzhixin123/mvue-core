<template>
<div class="grid-con">
    <div class="toolBar" v-if="!innerToolbar.hide">
        <Button @click="refresh()" type="ghost" icon="refresh"></Button>
        <template v-for="(toolbarBtn,index) in innerToolbar.btns">
            <Button v-if="!toolbarBtn.render" :key="index"
                    type="primary"  :icon="toolbarBtn.icon"
                    @click="toolbarClick(toolbarBtn)"
                    >{{toolbarBtn.title}}</Button>
            <toolbar-btn-render v-if="toolbarBtn.render" :render="toolbarBtn.render" :key="index" :toolbar-btn="toolbarBtn"></toolbar-btn-render>
        </template>
        <Input v-if="innerToolbar.quicksearch&&innerToolbar.quicksearch.fields"
               v-model="quicksearchKeyword" :placeholder="innerToolbar.quicksearch.placeholder"
               icon="search" style="width: 150px;" :autofocus="true"/>
        <advance-search v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0" :entity-name="metaEntity" :advance-search-fields="innerToolbar.advanceSearchFields" @do-advance-search="doAdvanceSearch"></advance-search>
    </div>
    <div class="data-table-list">
        <Table :columns="innerColumns" :data="filteredData" 
            @on-selection-change="handleOnSelectionChange"
            @on-sort-change="handleSortChange">
        </Table>
    </div>
    <div class="tableBox-tool" v-if="pager">
        <div class="pagination form-inline">
            <a class="btn btn-default" :disabled="pageIndex<=1" @click="pageIndexOne">首页</a>
            <a class="btn btn-default" :disabled="pageIndex<=1" @click="pageIndexPrevious">上一页</a>
            <a class="btn btn-default" :disabled="pageIndex>=pageCount" @click="pageIndexNext">下一页</a>
            <a class="btn btn-default" :disabled="pageIndex>=pageCount" @click="pageIndexLast">尾页</a>
            <span class="form-group">
            <select class="form-control" v-model="pageSize">
                <option v-for="(s,index) in pagerSizes" :key="index" :value="s" :title="index" :selected="pageSize===s">
                    {{s}}
                </option>
            </select>
            </span>
            <span>总共{{totalCount}}条数据</span>
        </div>
    </div>
</div>
</template>
<script>
import metaGrid from "./js/metagrid";
import toolbarBtnRender from "./js/toolbar_btn_render";
var utils= require('../../libs/utils');
export default {
    props: {
      "metaEntity": {
        type: String,
        required: false
      },
      "pagerSizes": {
        type: Array,
        required: false,
        default: function () {
          return ["10", "20", "50", "100"];
        }
      },
      "pager": {
        type: Boolean,
        required: false,
        default: true
      },
      "toolbar": {
        type: Object
      },
      "createPath": {  //创建表单的路径或路由名
        type: String,
        required: false
      },
      "editPath": {  //修改表单的路径或路由名
        type: String,
        required: false
      },
      "viewPath": {  //查看表单的地址
        type: String,
        required: false
      },
      "queryUrl": {//queryUrl和queryResource二选一
        type: String,
        required: false
      },
      "queryResource": {//代表vue-resource定义的resource，用来做数据查询
        type: Object,
        required: false
      },
      "queryOptions": {//queryUrl或者queryResource查询的参数，对应api query接口的参数，包括排序、分页等参数设置
        type: Object,
        required: false
      },
      "columns": {
        type: Array,
        required: false,
      },
      "contextParent":{//grid的自定义父容器
        type:Object
      }
    },
    data:function(){
        return {
            innerColumns:[],
            innerQueryResource:this.queryResource,
            innerQueryOptions:_.cloneDeep(this.queryOptions),
            innerToolbar:{
                    hide: (this.toolbar&&this.toolbar.hide)||false,
                    btns: (this.toolbar&&this.toolbar.btns)||[],
                    quicksearch: (this.toolbar&&this.toolbar.quicksearch)||{
                        fields: null,
                        placeholder: ""
                    },
                    advanceSearchFields:(this.toolbar&&this.toolbar.advanceSearchFields)||[]
                },
            data:[],//原始数据
            checked:[],//已经选择的数据
            quicksearchKeyword:"",//快捷查询输入的值
            changedQueue: [],//智能搜索的变化队列
            //begin 分页相关参数
            pageSize: this.pagerSizes[0],
            pageIndex: 1,
            totalCount: 0,
            pageCount: 1,
            //end 分页相关参数
            orderby:"",//只支持一个orderby，用户点击排序后将覆盖默认的排序规则
            advanceSearchFilters:[],//高级查询设置的查询条件
        };
    },
    computed:{
        filteredData:function(){//用来处理local和远程的数据过滤，目前通过pager参数为true指定为远程搜索
            var _this=this;
            if(this.pager){
                return this.data;
            }else{
                let _filteredData=[];
                _.each(this.data, function (item) {
                    var result = false;
                    _.each(_this.innerToolbar.quicksearch.fields, function (searchField) {
                        var contains = item[searchField].indexOf(_this.quicksearchKeyword) != -1;
                        if (contains) {
                            result = true;
                            return false;
                        }
                    });
                    if (!!result) {
                        _filteredData.push(item);
                    }
                });
                return _filteredData;
            }
        }
    },
    watch: {
        quicksearchKeyword: function () {
            var _this = this;
            if (_this.pager) {
            //智能搜索包装器，在用户快速输入时先不查询，直到用户输入完毕再查询
            Utils.smartSearch(_this, function () {
                _this.pageIndex = 1;
                _this.reload();
            });
            }
        },
        metaEntity:function(){
            if(this.metaEntity){
                metaGrid.initGridByMetabase(this);
                this.reload();
            }
        },
        pageSize:function (newVal, oldVal) {
            if (newVal != oldVal) {
                this.pageIndex = 1;
                this.reload();
            }
        },
        queryOptions:{
            handler:function(){
                this.reload();
            },
            deep:true
        }
    },
    mounted:function(){
        var _this=this;
        metaGrid.initGridByMetabase(_this);
        this.reload();
    },
    methods:{
        reload: function () {
            var _this = this;
            if ((!_this.queryUrl) && (!_this.innerQueryResource)) {
                console.log("请配置远程查询地址queryUrl或者queryResource");
                return;
            }
            var _queryOptions = _this.innerQueryOptions ? _.cloneDeep(_this.innerQueryOptions) : {}; //这里是克隆查询参数，避免查询参数污
            if (_this.pager) {//如果支持分页
                if (!_this.pageIndex) {
                    _this.pageIndex = 1;
                }
                _queryOptions.page = _this.pageIndex;
                _queryOptions.page_size = _this.pageSize;
                _queryOptions.total = true;
            }
            //如果启用了高级搜索，快捷搜索失效
            if(this.advanceSearchFilters&&this.advanceSearchFilters.length>0){
                let qsFilters = [];
                _.each(this.advanceSearchFilters,function(asField){
                    qsFilters.push(`${asField.key} ${asField.op} ${asField.value}`);
                });
                qsFilters=qsFilters.join(" and ");
                if(_queryOptions.filters){
                    _queryOptions.filters=`${_queryOptions.filters} and (${qsFilters})`;
                }else{
                    _queryOptions.filters=qsFilters;
                }
            }else if(_this.innerToolbar.quicksearch&&_this.innerToolbar.quicksearch.fields&&_this.quicksearchKeyword){
            //快捷搜索条件添加
                let qsFilters = [];
                _.each(_this.innerToolbar.quicksearch.fields, function (sField) {
                    let _keyword=utils.leapQueryValueEncode(_this.quicksearchKeyword);
                    qsFilters.push(`${sField} like '%${_keyword}%'`);
                });
                qsFilters=qsFilters.join(" or ");
                if(_queryOptions.filters){
                    _queryOptions.filters=`${_queryOptions.filters} and (${qsFilters})`;
                }else{
                    _queryOptions.filters=qsFilters;
                }
            }
            //如果用户点击了排序，覆盖默认排序
            if(this.orderby){
                _queryOptions.orderby=this.orderby;
            }
            var dataPromise=null;
            if (!!_this.queryUrl) {//传的是查询url
                dataPromise=_this.$http.get(_this.queryUrl,{params:_queryOptions}).then(function(resp){
                    return resp;
                });
            }else if (!!_this.innerQueryResource) {//传的是vue-resource对象
                dataPromise=_this.innerQueryResource.query(_queryOptions).then(function (resp) {
                   return resp;
                });
            }
            dataPromise.then(function(resp){
                _this.data = resp.data;
                if (_this.pager) {
                    //获取总数
                    _this.totalCount = _.toInteger(resp.headers.get("X-Total-Count"));
                    //获取总页数
                    _this.pageCount = _.ceil(_this.totalCount / _.toInteger(_this.pageSize));
                    //总页数至少为1
                    if (_this.pageCount == 0) {
                        _this.pageCount = 1;
                    }
                }
                _this.$emit("dataloaded", _this);
            });
        },
        refresh:function () {//刷新列表
            this.reload();
        },
        //begin 分页相关方法
        pageIndexOne: function () {
            if (this.pageIndex != 1) {
                this.pageIndex = 1;
                this.reload();
            }
        },
        pageIndexPrevious: function () {
            if (this.pageIndex > 1) {
                --this.pageIndex;
                this.reload();
            }
        },
        pageIndexNext: function () {
            if (this.pageIndex < this.pageCount) {
                ++this.pageIndex;
                this.reload();
            }
        },
        pageIndexLast: function () {
            if (this.pageIndex != this.pageCount) {
                this.pageIndex = this.pageCount;
                this.reload();
            }
        },
        //begin 远程排序
        handleSortChange({column,key,order}){
            if(order=="normal"){
                this.orderby=null;
            }else{
                this.orderby=`${key} ${order}`;
            }
            this.reload();
        },
        //end 远程排序
        //
        toolbarClick:function (btn) {
            var _self=this;
            var context={
                grid:_self,
                op:btn,
            };
            btn.onclick.call(context,{checked:_self.checked});
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters){
            this.quicksearchKeyword="";
            this.advanceSearchFilters=advanceSearchFilters;
            this.reload();
        },
        //begin 选择行
        handleOnSelectionChange(selection){
            this.checked=selection;
        }
        //end 选择行
    },
    components:{
        advanceSearch:require("./advance_search"),
        toolbarBtnRender:toolbarBtnRender
    }
}
</script>

<style lang="scss" scoped>
    .data-table-list{
        margin-top:10px;
        margin-bottom: 20px;
        width:100%;
    }
</style>

