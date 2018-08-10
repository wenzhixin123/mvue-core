<style lang="scss">
    @import "../components.scss";
</style>
<template>
    <b-list  v-if="preprocessed" ref="listInst"
            :columns="innerColumns"
            :query="query"
            :toolbar="toolbar"
            :filters="filters"
            :default-sort="defaultSort"

             :stripe="stripe"
             :border="border"
             :show-header="showHeader"
             :width="width"
             :height="height"
             :disabled-hover="disabledHover"
             :highlight-row="highlightRow"
             :row-class-name="rowClassName"
             :size="size"
             :no-data-text="noDataText"
             :no-filtered-data-text="noFilteredDataText"
             @on-current-change="handleOnCurrentChange"
             @on-select="handleOnSelect"
             @on-select-cancel="handleOnSelectCancel"
             @on-select-all="handleOnSelectAll"
             @on-selection-change="handleOnSelectionChange"
             @on-filter-change="handleOnFilterChange"
             @on-row-click="handleOnRowClick"
             @on-row-dblclick="handleOnRowDblclick"
             @on-expand="handleOnExpand"
             @on-sort-change="handleSortChange">
        <!-- 普通布局 -->
        <template slot="header" v-if="!innerToolbar.hide && !toolbarType">
                <slot name="top">
                    <!-- 高级搜索区 -->
                </slot>
                <div class="b-list-header">
                    <slot name="header-left">
                        <!-- 自定义菜单左侧区 -->
                    </slot>
                    <Button @click="reload()" icon="ios-refresh-empty"></Button>

                    <template v-if="innerToolbar.btns">
                        <meta-operation  v-for="(btn,index) in innerToolbar.btns" v-if="index<btnSizeBeforeMore" :key="index"
                                :operation="btn"  :widget-context="getWidgetContext()" class="grid-primary-btn">
                            <Button class="normal-btn"
                                    :disabled="btnIsDisabled(btn)"
                                    :type="btn.type?btn.type:'primary'"  :icon="btn.icon">{{btn.title}}</Button>
                        </meta-operation>
                        <Dropdown v-if="innerToolbar.btns.length>btnSizeBeforeMore" >
                            <Button>
                                更多操作
                                <Icon type="arrow-down-b"></Icon>
                            </Button>
                            <DropdownMenu slot="list">
                                <DropdownItem v-for="(btn,index) in innerToolbar.btns" v-if="index>=btnSizeBeforeMore"
                                              :disabled="btnIsDisabled(btn)"
                                              :divided="btn.divided" :name="index" :key="index">
                                    <meta-operation  :operation="btn" :widget-context="getWidgetContext()">
                                        <div style="display: block">{{btn.title}}</div>
                                    </meta-operation>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </template>
                    <slot name="header-middle">
                        <!-- 自定义菜单中部区 -->
                    </slot>
                    <Input v-if="innerToolbar.quicksearch&&innerToolbar.quicksearch.fields"
                           v-model="quicksearchKeyword" :placeholder="innerToolbar.quicksearch.placeholder"
                           icon="search" style="width: 150px;" :autofocus="true"/>
                    <advance-search :quicksearch-keyword="quicksearchKeyword" v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0" :entity-name="entityName"
                                    :advance-search-fields="innerToolbar.advanceSearchFields" @do-advance-search="doAdvanceSearch"></advance-search>
                    <slot name="header-right">
                        <!-- 自定义菜单右侧区 -->
                    </slot>
                    <slot name="viewSelect">
                        <!-- 视图切换区-->
                    </slot>
                </div>
        </template>
        <!--紧凑型toolbar布局-->
        <template slot="header" v-if="!innerToolbar.hide && toolbarType=='compact'">
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
                        <div class="concat-toolbar-btn" @click="reload()"><Icon type="refresh"></Icon>刷新</div>
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

            <!--批量操作的工具栏-->
            <div v-if="!innerToolbar.hide && toolbarType=='compact' && innerToolbar.batchBtns" class="toolbar-batch-operations" style="display:table;" v-show="selectedItems&&selectedItems.length>0">
                <div style="display:table-cell;vertical-align:middle;">
                    <span class="checked-info-span tools-color">已选中{{selectedItems.length}}项目</span>
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
        </template>
    </b-list>
</template>
<script>
import metabase from '../../libs/metadata/metabase';
import OperationUtils from '../meta_operation/js/operation_utils';
import commonOperation from '../meta_operation/js/common_operation';//widgetMode true
import noneWidgetModeCommonOperation from './js/metagrid_operation';//widgetMode false
import gridBase from './js/entity_grid_base';
import utils from '../../libs/utils';
import { leapQueryConvertor } from "mvue-components";
export default {
    mixins:[gridBase],
    props: {
        "filters": {//高级查询的条件和列表头部的筛选条件设置
            type: Object
        },
        "defaultSort": {//默认排序设置{key:'',order:'desc'}
            type: Object
        },
        "toolbar": {
            type: Object,
            default() {
                return {};
            }
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
        "context": {
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
        "preprocessor": {//数据预处理函数，对获取到数据作预处理转换
            type: Function,
            required: false
        },
        "pageSizeKey": {
            type: String,
            default: "page_size"
        },
        "pageKey": {
            type: String,
            default: "page"
        },
        "pageStart0": {//表示起始页是否从0开始，leap从1开始，activiti从0开始
            type: Boolean,
            default: false
        },
        "highlightRow": {//iview table属性，用来单选选中高亮
            type: Boolean,
            default: false
        },
        "showIndex": {//是否显示序号列
            type: Boolean,
            default: true
        },
        "widgetMode": {
            /** 是否部件模式，默认false对应普通模式，true则对应部件模式
             *  普通模式：此时通用操作的实现使用./js/metagrid_operation.js中的实现
             *  部件模式：此时通用操作的实现使用../meta_operation/common_operation.js实现
             */
            type: Boolean,
            default: false
        },
        "metaEntityName": {//元数据实体名称，可由外部传入
            type: String
        },
        wrapperClass: {
            type: [String, Object, Array],
            default: "default-list-wrapper"
        },
        stripe: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        width: {
            type: [Number, String]
        },
        height: {
            type: [Number, String]
        },
        disabledHover: {
            type: Boolean,
            default: false
        },
        rowClassName: {
            type: Function,
            default() {
                return '';
            }
        },
        size: {
            type: String
        },
        noDataText: {
            type: String
        },
        noFilteredDataText: {
            type: String
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
            selectedItems:[],//已经选择的数据
            quicksearchKeyword:"",
            advanceSearchFilters:[],//高级查询设置的查询条件
            multipleFiltersValueId:"",//用户选择的默认条件id
            multipleFiltersValue:"",//用户选择的默认条件值
            showQuickSearchInput:false,//toolbar concat模式时显示和隐藏快捷搜索框
            loadingData:false,//表示是否正在远程请求数据
        };
    },
    computed:{
        btnSizeBeforeMore(){//在[更多操作]按钮前显示的按钮个数
            var size=this.toolbar&&this.toolbar.btnSizeBeforeMore;
            return size||1;
        }
    },
    watch: {
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
            return this.wrappedBtn(commonOpt);
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
                    _btns.push(this.wrappedBtn(btn));
                }
            });
            return _btns;
        },
        query:function (ctx) {
            this.selectedItems=[];
            var _this = this;
            if ((!_this.queryUrl) && (!_this.innerQueryResource)) {
                console.log("请配置远程查询地址queryUrl或者queryResource");
                return;
            }
            var _queryOptions=this.buildQueryOptions(ctx);
            return new Promise((resolve,reject)=> {
                var dataPromise = null;
                if (!!_this.queryUrl) {//传的是查询url
                    _this.loadingData = true;
                    dataPromise = _this.$http.get(_this.queryUrl, {params: _queryOptions});
                } else if (!!_this.innerQueryResource) {//传的是vue-resource对象
                    _this.loadingData = true;
                    dataPromise = _this.innerQueryResource.query(_queryOptions);
                }
                dataPromise.then(function (resp) {
                    _this.loadingData=false;
                    //重新加载数据后清空选中的数据
                    _this.selectedItems=[];
                    if(_this.preprocessor){//调用外部的数据处理器
                        listData=_this.preprocessor(_this,resp);
                    }else{
                        var total = _.toSafeInteger(resp.headers['x-total-count']) || resp.data.length;
                        var listData = {
                            data: resp.data,
                            total: total
                        };
                    }
                    resolve(listData);
                    _this.$emit("dataloaded", _this);
                }, () => {
                    _this.loadingData=false;
                    reject();
                });
            });
        },
        reload:function(){
            var _self=this;
            _self.$refs.listInst.doReload();
        },
        buildQueryOptions:function (queryCtx) {
          var _this = this;
          var _queryOptions = _this.innerQueryOptions ? _.cloneDeep(_this.innerQueryOptions) : {}; //这里是克隆查询参数，避免查询参数污
          if (_this.pager) {//如果支持分页
            //如果起始页从0开始，传到后台的参数要减1
            _queryOptions[this.pageKey] = this.pageStart0?queryCtx.currentPage-1:queryCtx.currentPage;
            _queryOptions[this.pageSizeKey] = queryCtx.currentPageSize;
            _queryOptions.total = true;
          }
            //如果用户点击了排序，覆盖默认排序
            if(queryCtx.sort){
                _queryOptions.orderby=`${queryCtx.sort.key} ${queryCtx.sort.order}`;
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
          //快捷搜索条件添加
          if(_this.innerToolbar.quicksearch&&_this.innerToolbar.quicksearch.fields&&_this.quicksearchKeyword){
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
          return _queryOptions;
        },
        wrappedBtn:function (btn) {
            /*var _self=this;
            if(btn.onclick){
                var rawClick=btn.onclick;
                btn.onclick=function (context) {
                    var wrappedContext=_.extend(context,{
                        op:btn
                    });
                    rawClick(wrappedContext,{checked:_self.selectedItems});
                };
            }*/
            return btn;
        },
        handleOnVisibleChange(visible){
            this.dropdownVisible=visible;
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters,quicksearchKeyword){
            this.quicksearchKeyword=quicksearchKeyword||"";
            this.advanceSearchFilters=advanceSearchFilters;
            this.reload();
        },
        //begin 单击行
        handleOnRowClick(row,index){
            if(!this.viewOnSingleClickRow){
                this.$emit("on-row-click",row,index);
                return;
            }
            //处理由部件配置传入的单击行操作
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
                if(commonOptName){//通用操作
                    let commonOpt=this.getCommonOpt(btn);
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
            this.$emit("on-row-click",row,index);
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
                    grid: $.extend(_self, {checked: _self.selectedItems}),
                    metaEntity: _self.metaEntity,
                    selectedIds: _self.selectedItems.map(function (obj) {
                        return obj.id
                    }),
                    selectedItems: _self.selectedItems
                };
            }
            return context;
        },
        //判断按钮是否禁用
        btnIsDisabled(btn){
            //btn 写了disabled:true
            if(btn.disabled===true){
                return true;
            }else if(_.isFunction(btn.disabled)){
                var ctx={
                    selectedItems:this.selectedItems
                };
                return btn.disabled(ctx);
            }
            return false;
        },
        //选择多行
        //选择单行
        handleOnCurrentChange(currentRow,oldCurrentRow){
            this.$emit("on-current-change",currentRow,oldCurrentRow);
        },
        handleOnSelect(selection,row){
            this.$emit("on-select",selection,row);
        },
        handleOnSelectCancel(selection,row){
            this.$emit("on-select-cancel",selection,row);
        },
        handleOnSelectAll(selection){
            this.$emit("on-select-all",selection);
        },
        //选择多行
        handleOnSelectionChange(selection){
            this.selectedItems=selection;
            this.$emit("on-selection-change",selection);
        },
        handleOnRowDblclick(row,index){
            this.$emit("on-row-dblclick",row,index);
        },
        handleOnExpand(row,status){
            this.$emit("on-expand",row,status);
        },
        //排序列
        handleSortChange({column,key,order}){
            this.$emit("on-sort-change",{column,key,order});
        },
        handleOnFilterChange(row){
            this.$emit("on-filter-change",row);
        },
    },
    components:{
        advanceSearch:require("./advance_search")
    }
}
</script>

