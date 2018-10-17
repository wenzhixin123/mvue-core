<template>
<div class="grid-con" v-if="preprocessed">
    <slot name="toolbarSlot">
    <!--紧凑型toolbar布局-->
    <div class="toolBar compact" v-if="!innerToolbar.hide && toolbarType=='compact'">
        <Row type="flex" align="middle" style="padding-bottom:16px;">
            <i-col span="4" style="text-align:left;">
                <slot name="viewSelect"></slot>
            </i-col>
            <i-col span="20" style="text-align:right;">
                <div class="grid-toolbar-common-btns">
                    <div v-if="innerToolbar.quicksearch&&innerToolbar.quicksearch.fields" style="display:inline-block;">
                        <Input v-if="showQuickSearchInput" v-model="quicksearchKeyword" :placeholder="innerToolbar.quicksearch.placeholder"
                            icon="ios-search" @on-click="showQuickSearchInput=false" style="width: 150px;margin-right:10px;" :autofocus="true"/>
                        <div class="concat-toolbar-btn" v-if="!showQuickSearchInput" @click="showQuickSearchInput=true"><Icon type="search"></Icon>搜索</div>
                    </div>
                    <advance-search :quicksearch-keyword="quicksearchKeyword" :toolbar-type="toolbarType" v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0" :entity-name="entityName" :advance-search-fields="innerToolbar.advanceSearchFields" @do-advance-search="doAdvanceSearch"></advance-search>
                    <div class="concat-toolbar-btn" @click="refresh()"><Icon type="refresh"></Icon>刷新</div>
                </div>
                <div v-if="innerToolbar.btns" class="innerToolbar">
                    <meta-operation v-for="(toolbarBtn,index) in innerToolbar.btns" :key="index" v-if="index<1" :operation="toolbarBtn" :widget-context="getWidgetContext()">
                        <Button style="margin-right:-8px;" type="primary" size="small" :title="toolbarBtn.title" class="default-color-btn">
                            <Icon :type="toolbarBtn.icon"></Icon>
                            {{toolbarBtn.title}}
                        </Button>
                    </meta-operation>
                    <Dropdown v-if="innerToolbar.btns.length>1" @on-click="handleDropdownMenuClick" placement="bottom-end" trigger="click">
                            <Button type="primary" title="更多" size="small" class="default-color-btn">
                                <Icon type="arrow-down-b"></Icon>
                            </Button>
                            <DropdownMenu slot="list">
                                <DropdownItem v-for="(toolbarBtn,index) in innerToolbar.btns" v-if="index>=1" :name="index" :key="index">
                                    <meta-operation :operation="toolbarBtn" :widget-context="getWidgetContext()">
                                        <Button :key="index"
                                                type="text"  :icon="toolbarBtn.icon"
                                        >{{toolbarBtn.title}}</Button>
                                    </meta-operation>
                                </DropdownItem>
                            </DropdownMenu>
                    </Dropdown>
                </div>
            </i-col>
        </Row>
    </div>
    <!--默认toolbar布局-->
    <div class="toolBar default" v-if="!innerToolbar.hide && !toolbarType">
        <slot name="viewSelect"></slot>
        <button @click="refresh()" type="button" class="ivu-btn ivu-btn-primary ivu-btn-circle ivu-btn-icon-only" title="刷新">
            <i class="ivu-icon ivu-icon-ios-refresh-empty" style="font-size:32px;"></i>
        </button>
        <template v-if="innerToolbar.btns" v-for="(toolbarBtn,index) in innerToolbar.btns">
            <meta-operation :operation="toolbarBtn" :key="index" :widget-context="getWidgetContext()">
                <Button type="primary"  :icon="toolbarBtn.icon">{{toolbarBtn.title}}</Button>
            </meta-operation>
        </template>
        <Input v-if="innerToolbar.quicksearch&&innerToolbar.quicksearch.fields"
               v-model="quicksearchKeyword" :placeholder="innerToolbar.quicksearch.placeholder"
               icon="search" style="width: 150px;" :autofocus="true"/>
        <advance-search :quicksearch-keyword="quicksearchKeyword" v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0" :entity-name="entityName" :advance-search-fields="innerToolbar.advanceSearchFields" @do-advance-search="doAdvanceSearch"></advance-search>
    </div>
    </slot>
    <!--批量操作的工具栏-->
    <div v-if="!innerToolbar.hide && toolbarType=='compact' && innerToolbar.batchBtns" class="toolbar-batch-operations" style="display:table;" v-show="checked&&checked.length>0">
        <div style="display:table-cell;vertical-align:middle;">
        <span class="checked-info-span tools-color">已选中{{checked.length}}项目</span>
        <template v-if="innerToolbar.btns" v-for="(toolbarBtn,index) in innerToolbar.batchBtns">
            <meta-operation :key="index" :operation="toolbarBtn" :widget-context="getWidgetContext()">
                <Button v-if="!toolbarBtn.render" size="small"
                        type="text"  :icon="toolbarBtn.icon"
                >{{toolbarBtn.title}}</Button>
            </meta-operation>
        </template>
        </div>
        <div style="width:77px;display:table-cell;vertical-align:middle;background-color:#fff;">

        </div>
    </div>
    <div class="data-table-list">
        <Table :loading="loadingData" 
            :columns="innerColumns" 
            :data="filteredData"
            :highlight-row="highlightRow"
            @on-current-change="handleOnCurrentChange"
            @on-selection-change="handleOnSelectionChange"
            @on-row-click="handleOnRowClick"
            @on-sort-change="handleSortChange">
        </Table>
    </div>
    <div class="tableBox-tool" v-if="pager">
        <div class="pagination form-inline font12">
            <a class="btn btn-sm btn-default" :disabled="pageIndex<=1" @click="pageIndexOne">首页</a>
            <a class="btn btn-sm btn-default" :disabled="pageIndex<=1" @click="pageIndexPrevious">上一页</a>
            <a class="btn btn-sm btn-default" :disabled="pageIndex>=pageCount" @click="pageIndexNext">下一页</a>
            <a class="btn btn-sm btn-default" :disabled="pageIndex>=pageCount" @click="pageIndexLast">尾页</a>
            <span class="form-group">
            <select class="form-control div-inline-block font12" style="height:30px;" v-model="pageSize">
                <option v-for="(s,index) in pagerSizes" :key="index" :value="s" :title="index" :selected="pageSize===s">
                    {{s}}
                </option>
            </select>
            </span>
            <span>总共{{totalCount}}条数据</span>
        </div>
    </div>

    <Modal class="popup-widget-con" v-model="popupWidgetModal"
           :width="modalWidth"
           :title="modalTitle"
           :scrollable="true"
           :mask-closable="false"
    >
        <div class="modal-inner-widget" :style="{height:modalHeight+'px'}">
            <meta-widget-page :widget-params="pageParams"></meta-widget-page>
        </div>
        <div slot="footer"></div>
    </Modal>
</div>
</template>
<script>
import metabase from '../../libs/metadata/metabase';
import OperationUtils from '../meta_operation/js/operation_utils';
import commonOperation from '../meta_operation/js/common_operation';//widgetMode true
import noneWidgetModeCommonOperation from './js/metagrid_operation';//widgetMode false
import gridBase from './js/entity_grid_base';
import utils from '../../libs/utils';
export default {
    mixins:[gridBase],
    props: {
      "toolbar": {
        type: Object
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
      "operationsWithTitleColumn": {//是否操作列合并到标题列
        type: Boolean,
        required: false,
        default: false
      },
      "toolbarType": {//'compact':紧凑型toolbar布局；不设置用默认布局
        type: String,
        required: false
      },
      "viewOnSingleClickRow": {//是否开启单击行跳到查看页
        type: Boolean,
        required: false,
        default: true
      },
      "viewId": {
        type: String,
        required: false
      },
      "filterId": {
        type: String,
        requited: false
      },
      "context":{
        type: Object,
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
      "preprocessor":{//数据预处理函数，对获取到数据作预处理转换
          type:Function,
          required: false
      },
      "pageSizeKey":{
          type:String,
          default:"page_size"
      },
      "pageKey":{
          type:String,
          default:"page"
      },
      "pageStart0":{//表示起始页是否从0开始，leap从1开始，activiti从0开始
          type:Boolean,
          default:false
      },
      "highlightRow":{//iview table属性，用来单选选中高亮
          type:Boolean,
          default:false
      },
      "showIndex":{//是否显示序号列
          type:Boolean,
          default:true
      },
      "widgetMode":{
         /** 是否部件模式，默认false对应普通模式，true则对应部件模式
          *  普通模式：此时通用操作的实现使用./js/metagrid_operation.js中的实现
          *  部件模式：此时通用操作的实现使用../meta_operation/common_operation.js实现
          */
          type:Boolean,
          default:false
      },
      "metaEntityName":{//元数据实体名称，可由外部传入
          type:String
      }
    },
    data:function(){
        /**
         * 元数据实体名称可由属性参数metaEntityName(内部已经使用了entityName属性)或者路由参数entityName传递进来
         */
        var entityName = this.metaEntityName||this.$route.params.entityName;
        var metaEntity = metabase.findMetaEntity(entityName);
        return {
            entityName: entityName,
            metaEntity: metaEntity,
            preprocessed: false,
            formShortId: null,//如果表单自定义过了，则表单也从自定义表单的formShortId获取
            viewShortId: null,//如果视图自定义过了，则视图列表也从自定义视图的viewShortId获取
            createPath:null,
            editPath:null,
            viewPath:null,
            innerColumns:_.cloneDeep(this.columns),
            innerQueryResource:this.queryResource,
            innerQueryOptions:_.cloneDeep(this.queryOptions),
            innerToolbar:{
                hide: (this.toolbar&&this.toolbar.hide)||false,
                    btns: this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.btns),//普通操作
                    singleBtns:this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.singleBtns),//基于单条数据的操作
                    batchBtns: this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.batchBtns),//基于多条数据的操作
                    rowSingleClick: (this.toolbar&&this.toolbar.rowSingleClick),//单击行的操作
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
            multipleFiltersValueId:"",//用户选择的默认条件id
            multipleFiltersValue:"",//用户选择的默认条件值
            showQuickSearchInput:false,//toolbar concat模式时显示和隐藏快捷搜索框
            loadingData:false,//表示是否正在远程请求数据
            //额外添加的参数--绑定单行弹窗操作
            modalWidth:500,
            modalHeight:340,
            modalTitle:"",
            popupWidgetModal:false,
            pageParams:{},
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
        pageSize:function (newVal, oldVal) {
            if (newVal != oldVal) {
                this.pageIndex = 1;
                this.reload();
            }
        },
        queryOptions:{
            handler:function(){
                this.innerQueryOptions=_.cloneDeep(this.queryOptions),
                this.reload();
            },
            deep:true
        },
        viewId(){
            this.preprocessed=false;
            //检测视图id变化后重新获取视图配置
            this.initGridByViewId();
        },
        filterId(){
            this.preprocessed=false;
            this.initGridByViewId();
        },
        preprocessed(){
            //当grid已经根据viewId初始化完成后，重新加载grid
            if(this.preprocessed){
                this.reload();
            }
        }
    },
    mounted:function(){
        //根据viewId获取视图配置并初始化grid的一些属性，在entity_grid_base中实现
        this.initGridByViewId();
    },
    methods:{
        getCommonOpt(name){//根据通用操作的name，返回具体的操作，包括onclick函数等
            let commonOpt=null;
            if(this.widgetMode){
                commonOpt=commonOperation.createOperation(name);
            }else{
                commonOpt=noneWidgetModeCommonOperation.createOperation(name);
            }
            return commonOpt;
        },
        convertToCommonOptIfNeeded(btns){//将通过属性传递的toolbar中的通用操作简写方式（只写了name），转成具体的操作对象（包含onclick函数等）
            let _btns=[];
            if(!btns){
                return _btns;
            }
            _.each(btns,(btn)=>{
                if(_.isString(btn)){
                    let newBtn={
                        name:btn,
                        operationType:"common"
                    };
                    let commonOpt=this.getCommonOpt(btn);
                    if(commonOpt){
                        _btns.push(Object.assign(newBtn,commonOpt));
                    }
                }else{
                    _btns.push(btn);
                }
            });
            return _btns;
        },
        reload: function () {
            var _this = this;
            if ((!_this.queryUrl) && (!_this.innerQueryResource)) {
                console.log("请配置远程查询地址queryUrl或者queryResource");
                return;
            }
            var _queryOptions=this.buildQueryOptions();
            var dataPromise=null;
            if (!!_this.queryUrl) {//传的是查询url
                _this.loadingData=true;
                dataPromise=_this.$http.get(_this.queryUrl,{params:_queryOptions});
            }else if (!!_this.innerQueryResource) {//传的是vue-resource对象
                _this.loadingData=true;
                dataPromise=_this.innerQueryResource.query(_queryOptions);
            }
            dataPromise.then(function(resp){
                _this.loadingData=false;
                //重新加载数据后清空选中的数据
                _this.checked=[];
                if(_this.preprocessor){//调用外部的数据处理器
                    _this.preprocessor(_this,resp);
                }else{
                    _this.data = resp.data;
                    if (_this.pager) {
                        //获取总数
                        _this.totalCount = _.toInteger(resp.headers["x-total-count"]);
                        //获取总页数
                        _this.pageCount = _.ceil(_this.totalCount / _.toInteger(_this.pageSize));
                        //总页数至少为1
                        if (_this.pageCount == 0) {
                            _this.pageCount = 1;
                        }
                    }
                }
                _this.$emit("dataloaded", _this);
            },function(){
                _this.loadingData=false;
            });
        },
        buildQueryOptions:function () {
          var _this = this;
          var _queryOptions = _this.innerQueryOptions ? _.cloneDeep(_this.innerQueryOptions) : {}; //这里是克隆查询参数，避免查询参数污
          if (_this.pager) {//如果支持分页
            if (!_this.pageIndex) {
              _this.pageIndex = 1;
            }
            //如果起始页从0开始，传到后台的参数要减1
            _queryOptions[this.pageKey] = this.pageStart0?_this.pageIndex-1:_this.pageIndex;
            _queryOptions[this.pageSizeKey] = _this.pageSize;
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
          }
          if(_this.innerToolbar.quicksearch&&_this.innerToolbar.quicksearch.fields&&_this.quicksearchKeyword){
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
          return _queryOptions;
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
            btn.onclick&&btn.onclick.call(context,{checked:_self.checked});
        },
        handleOnVisibleChange(visible){
            this.dropdownVisible=visible;
        },
        handleDropdownMenuClick(itemName){
            var btn=this.innerToolbar.btns[itemName];
            //this.toolbarClick(btn);
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters,quicksearchKeyword){
            this.quicksearchKeyword=quicksearchKeyword||"";
            this.advanceSearchFilters=advanceSearchFilters;
            this.reload();
        },
        //选择单行
        handleOnCurrentChange(currentRow,oldCurrentRow){
            this.$emit("on-current-change",currentRow,oldCurrentRow)
        },
        //选择多行
        handleOnSelectionChange(selection){
            this.checked=selection;
        },
        //begin 单击行
        handleOnRowClick(row,index){
            if(!this.viewOnSingleClickRow){
                return;
            }
            //处理由部件配置传入的列表操作的第一个操作/*单击行操作*/
            var _rowSingleClick=this.innerToolbar.rowSingleClick;
            if(_rowSingleClick){
                var _widgetCtx={
                    grid:this,
                    metaEntity:this.metaEntity,
                    selectedId: row.id,
                    selectedItem: row
                };
                var operation=OperationUtils.expandOperation(_rowSingleClick,{
                    operation:_rowSingleClick,
                    widgetContext:_widgetCtx
                });
                let commonOptName=operation.name;
                //目前支持通用操作和脚本操作
                if(commonOptName&&this.getCommonOpt(commonOptName)){//通用操作
                    let commonOpt=this.getCommonOpt(commonOptName);
                    if(commonOpt){
                        operation= _.extend(operation,commonOpt);
                        operation.onclick(_widgetCtx,{operation:operation});
                        return;
                    }
                }else if(operation.onclick){//脚本操作
                    if(_.isFunction(operation.onclick)){
                        operation.onclick(Object.assign(_widgetCtx,operation),{operation:operation});
                    }else{
                        var onclick=Function('"use strict";return ' + operation.onclick  )();
                        onclick(Object.assign(_widgetCtx,operation),{operation:operation});
                    }
                }else if(operation.operationType=="toPage"){
                    this.modalWidth = _rowSingleClick.modalWidth||500;
                    this.modalHeight = _rowSingleClick.modalHeight||340;
                    this.modalTitle = _rowSingleClick.page.title;

                    function getIdFromContext(){
                        var context = Object.assign(_widgetCtx, operation);
                        var id = context.selectedId;
                        var metaEntity = context.metaEntity;
                        if(!context.selectedItem&&context.selectedItems&&context.selectedItems.length){
                            //按钮放置的是在工具栏
                            context.selectedItem = context.selectedItems[(context.selectedItems.length-1)]
                            context.selectedId = context.selectedItem.id;
                            id = context.selectedId;
                        }
                        if (!id&&context.selectedItem) {
                            var selectedItem = context.selectedItem;
                            if (selectedItem) {
                                //计算id字段
                                var idField = null;
                                if (!_.isEmpty(metaEntity)) {
                                    idField = metaEntity.getIdField();
                                }
                                id = selectedItem[idField];
                            }
                        }//获取传入的对象id和实体信息
                        return {dataId:id,entity:metaEntity.metaEntityId};
                    }

                    this.close = function(){//关闭对话框
                        this.pageParams = {pageId :""};
                        this.popupWidgetModal=false;
                    }

                    Object.assign(this.$route.query,getIdFromContext());
                    this.pageParams = Object.assign({pageId:operation.page.id},getIdFromContext());
                    if(operation.isPopup){
                        this.popupWidgetModal=!this.popupWidgetModal;
                    }else{
                        router.push({name:"defaultPageIndex",query:this.pageParams,params:this.pageParams});
                    }
                }
            }
            //这里btns必须包含view操作
            var btn=_.find(this.innerToolbar.singleBtns, function(o) {
                return o.id ==='view';
            });
            if(btn&&Utils.hasDataPerm(row,btn)){
                var context={
                    grid:this,
                    metaEntity:this.metaEntity,
                    selectedId: row.id,
                    selectedItem: row
                };
                //btn.onclick&&btn.onclick.call(context,{row:row});
                btn.onclick&&btn.onclick(context,{operation:btn});
            }
        },
        //end 单击行
        getWidgetContext(){
            //获取操作需要的一些参数
            let _self = this, context;
            if(this.context){
                //是否-传入了上下文内容
                context = this.context
            }else {
                context = {
                    grid: $.extend(_self, {checked: _self.checked}),
                    metaEntity: _self.metaEntity,
                    selectedIds: _self.checked.map(function (obj) {
                        return obj.id
                    }),
                    selectedItems: _self.checked
                };
            }
            return context;
        }
    },
    components:{
        advanceSearch:require("./advance_search")
    }
}
</script>

<style lang="scss">
    .data-table-list{
        margin-top:10px;
        margin-bottom: 20px;
        width:100%;
    }
    .grid-con{
        position: relative;
        .toolbar-batch-operations{
            position: absolute;
            top:45px;
            left:77px;
            z-index:2;
            background-color:#f3f3f3;
            width:100%;
            height:40px;
            .ivu-btn{
                font-size:12px;
            }
            .checked-info-span{
                vertical-align: middle;
                font-size:12px;
            }
        }
        .ivu-checkbox{
            margin-top:8px;
        }
        .default.toolBar{
            .widget-operation{
                margin-right:5px;
            }
        } 
        .compact.toolBar{
            .innerToolbar{
                display: inline-block;
                button +.ivu-dropdown{
                    border-left: 1px rgba(255, 255, 255, .2) solid;

                    button{
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                }
                .widget-operation +.ivu-dropdown{
                    border-left: 1px rgba(255, 255, 255, .2) solid;

                    button{
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                }
            }
        }
    }
</style>

