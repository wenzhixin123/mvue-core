import globalContext from '../../libs/context';
import initByMetadata from './js/init-by-metadata';
import noneWidgetModeCommonOperation from './js/metagrid_operation';//widgetMode false
export default{
    props: {
        "toolbar": {
            type: Object,
            default() {
                return {};
            }
        },
        "operationsWithTitleColumn": {//是否操作列合并到标题列
            type: Boolean,
            required: false,
            default: false
        },
        "context": {
            type: Object,
            required: false
        },
        "pageSizeOpts": {
            type: Array,
            required: false,
            default: function () {
                return [10, 20, 50, 100];
            }
        },
        "pager": {
            type: Boolean,
            required: false,
            default: true
        },
        "pageSize": {//每页条数
            type: Number,
            default: 10
        },
        "preprocessor": {//TODO 数据预处理函数，对获取到数据作预处理转换
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
        "highlightRow": {//iview table属性，用来单选选中高亮
            type: Boolean,
            default: false
        },
        "showIndex": {//是否显示序号列
            type: Boolean,
            default: true
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
    data(){
        return {
            metaEntity: null,
            preprocessed: false,
            filtersFromQuery:{},//来自查询条件的默认过滤条件
            filtersFromColumnHeader:{},//来自列header的查询条件
            innerSort:null,
            innerColumns:[],
            queryResource:null,
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
            quicksearchKeyword:"",//内部高级查询提供的快捷搜索词
            advanceSearchFilters:[],//内部高级查询设置的查询条件
            changedQueue:[]
        }
    },
    computed:{
        btnSizeBeforeMore(){//在[更多操作]按钮前显示的按钮个数
            var size=this.toolbar&&this.toolbar.btnSizeBeforeMore;
            return size||1;
        }
    },
    watch:{
        quicksearchKeyword: function () {
            if (this.pager) {
                this.reload();
            }
        }
    },
    methods:{
        getCommonOpt(name){//根据通用操作的name，返回具体的操作，包括onclick函数等
            let commonOpt=noneWidgetModeCommonOperation.createOperation(name);
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
        //利用元数据信息填充grid相关属性
        initGridByMetadata(){
            //如果外部没有指定默认排序，则使用实体更新时间字段作为默认排序
            if(!this.innerSort){
                this.innerSort=initByMetadata.buildDefaultOrderby(this);
            }
            //如果有来自查询条件的默认过滤器初始化
            var filtersFromQuery=initByMetadata.buildFiltersFromQuery(this);
            this.filtersFromQuery=filtersFromQuery;
            //如果外部没有定义快捷查询字段，利用title语义字段构造
            if(this.innerToolbar&&
                this.innerToolbar.quicksearch&&
                (!this.innerToolbar.quicksearch.fields)){
                let _fields=initByMetadata.buildDefaultQuickSearchFields(this);
                this.innerToolbar.quicksearch.fields=_fields;
            }
            //根据实体元数据初始化grid的列
            initByMetadata.initColumns(this);
            //预处理完毕，b-list可以渲染了
            this.preprocessed = true;
        },
        reload:function(){
            var _self=this;
            //智能搜索，快速连续调用多次只会执行一次
            globalContext.getMvueToolkit().utils.smartSearch(this, () =>{
                this.$refs.listInst.doReload();
            },"changedQueue");
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters,quicksearchKeyword){
            this.quicksearchKeyword=quicksearchKeyword||"";
            this.advanceSearchFilters=advanceSearchFilters;
            this.reload();
        },
        //begin 单击行
        handleOnRowClick(row,index){
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
        }
    },
    components:{
        advanceSearch:require("./advance_search")
    }
}