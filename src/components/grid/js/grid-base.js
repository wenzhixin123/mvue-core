import globalContext from '../../../libs/context';
import operationManager from "../../../libs/operation/operations";
import  gridProps from "./grid-props";
export default{
    mixins:[gridProps],
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
                btns: this.wrapBtns(this.toolbar&&this.toolbar.btns),//普通操作
                singleBtns:this.wrapBtns(this.toolbar&&this.toolbar.singleBtns),//基于单条数据的操作
                batchBtns: this.wrapBtns(this.toolbar&&this.toolbar.batchBtns),//基于多条数据的操作
                rowSingleClick: (this.toolbar&&this.toolbar.rowSingleClick),//单击行的操作
                quicksearch: (this.toolbar&&this.toolbar.quicksearch)||{
                    fields: null,
                    placeholder: ""
                },
                advanceSearchFields:(this.toolbar&&this.toolbar.advanceSearchFields)||[],
                advFormPopup:(this.toolbar&&this.toolbar.advFormPopup)?true:false//高级查询表单是否弹出，否则嵌入在列表上部
            },
            selectedItems:[],//已经选择的数据
            quicksearchKeyword:"",//内部高级查询提供的快捷搜索词
            advanceSearchFilters:[],//内部高级查询设置的查询条件
            advanceSearchJoins:'',//由内部高级查询设置的join条件
            changedQueue:[],
            currentQueryCtx:{},//当前查询的所有上下文参数对象
            currentQueryParams:null,//通过leap-query-convertor查询的最终拼接条件，{filters:'完整字符串'}不同于currentQueryCtx，是最终查询时完整的filters字符串
            //如果有默认高级查询条件，由默认条件激发查询
            innerLoadDataWhenMount:this.hasAdvFormDefault()?false:this.loadDataWhenMount
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
                this.reloadByQuickSearch();
            }
        }
    },
    methods:{
        hasAdvFormDefault(){
            return !_.isEmpty(this.toolbar&&this.toolbar.advFormDefault);
        },
        innerQuery(ctx){
            ctx.quicksearchKeyword=this.quicksearchKeyword;
            //外部高级查询和内部高级查询只能二选一，如果同时出现，这里不会合并
            //外部高级查询:可通过设置组件的top slot区模板和属性filters
            //内部高级查询:如果组件属性toolbar.advanceSearchFields的有值，则内部默认的高级查询条件需要合并到ctx的filters和quicksearchKeyword中
            var useInnerAdvSearch=this.toolbar && 
                this.toolbar.advanceSearchFields &&
                this.toolbar.advanceSearchFields.length>0
            if(useInnerAdvSearch){//内部高级查询
                //mappingKey
                let useInnerAdvSearchFilters={
                    op:"and",
                    rules:{}
                }
                _.each(this.advanceSearchFilters,asf=>{
                    useInnerAdvSearchFilters.rules[asf.key]={
                        op:asf.op,
                        value:asf.value,
                        mappingKey:asf.mappingKey
                    };
                });
                ctx.filters=useInnerAdvSearchFilters;
                if(this.advanceSearchJoins){
                    ctx.joins=this.advanceSearchJoins;
                }
            }//外部高级查询的查询条件自动在ctx里边，不需要特殊处理
            //1 如果有来自url查询条件的默认查询参数自动添加进去
            //2 如果有来自列header的查询条件也附加上去
            //这里如果外部也没有设置filters，给一个默认值，否则列表头部的查询会不生效
            if(!ctx.filters){
                ctx.filters={
                    op:"and",
                    rules:{}
                }
            }
            if(ctx.filters&&ctx.filters.rules){
                ctx.filters.rules=_.assign(ctx.filters.rules,this.filtersFromQuery,this.filtersFromColumnHeader);
            }
            //保存当前查询的上下文参数对象
            this.currentQueryCtx=ctx;
            if(this.query){//外部指定了query，用外部的
                return this.query(ctx,this.queryResource);
            }else{
                //外部指定了查询地址，由此地址构造查询resource
                let _resource=this.queryResource;
                if(this.queryUrl){
                    _resource=globalContext.buildResource(this.queryUrl);
                }
                //默认存在元数据情况下，肯定是存在实体的queryResource的，而且是leap的后台，使用leap转换器
                return globalContext.getMvueComponents().leapQueryConvertor.exec(_resource,ctx,(params)=>{
                    this.beforeQuery&&this.beforeQuery(params);
                    //每次查询记录最终的查询filters
                    this.currentQueryParams=_.cloneDeep(params);
                });
            }
        },
        reloadByQuickSearch:function(){
            var _self=this;
            var delay=500;
            if(this.innerToolbar && this.innerToolbar.quicksearch.delay){
                delay=this.innerToolbar.quicksearch.delay;
            }
            if(delay<0){
                return;
            }
            //智能搜索，快速连续调用多次只会执行一次
            globalContext.getMvueToolkit().utils.smartSearch(this, () =>{
                this.reload(true);
            },"changedQueue",delay);
        },
        reload:function (resetPage,evt) {
            if(evt&&evt.action=="delete"){
                this.$emit("on-row-delete",evt.ids);
            }
            this.$refs.listInst.doReload(resetPage);
            this.selectedItems=[];
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters,quicksearchKeyword,joins,connectKeyword){
            //如果关键字需要传递过来才修正
            if(connectKeyword){
                this.quicksearchKeyword=quicksearchKeyword||"";
            }
            this.advanceSearchFilters=advanceSearchFilters;
            this.advanceSearchJoins=joins;
            this.reload(true);
        },
        handleAdvFormSearch(){
            this.$refs.advFormRef.doSearch();
        },
        handleAdvFormReset(){
            this.$refs.advFormRef.doReset();
        },
        //end 单击行
        getWidgetContext(){
            //获取操作需要的一些参数
            let _self = this, context;
            if(this.context){
                //是否-传入了上下文内容
                context = this.context
            }else {
                let idField=_self.metaEntity.getIdField().name;
                context = {
                    grid: _.extend(_self, {checked: _self.selectedItems}),
                    metaEntity: _self.metaEntity,
                    selectedIds: _self.selectedItems.map(function (obj) {
                        return obj[idField]
                    }),
                    selectedItems: _self.selectedItems
                };
                if(_self.selectedItems&&_self.selectedItems.length==1){
                    context.selectedId=_self.selectedItems[0][idField];
                    context.selectedItem=_self.selectedItems[0];
                }
            }
            return context;
        },
        wrapBtns(btns) {
            var ops = {};
            if (this["entityName"]) {
                ops["entityName"] = this["entityName"]
            }
            let _btns = operationManager.batchCreate(btns, ops);
            _btns=_.filter(_btns,btn=>{
                return this.showBtn(btn);
            });
            //特殊处理弹出框列表上的create按钮
            let popupParent=this.getParentPopup();
            _.forEach(_btns,btn=>{
                if(btn.name =="create"||btn.name =="edit"){
                    if(popupParent){
                        btn.operationType="popup";
                        btn.url=btn.url||btn.name;
                    }
                }
            });
            return _btns;
        },
        //判断按钮是否禁用
        btnIsDisabled(btn){
            //btn 写了disabled:true
            if(btn.disabled===true){
                return true;
            }else if(_.isFunction(btn.disabled)){
                var ctx={
                    isGrid:true,
                    metaEntity:this.metaEntity,
                    selectedItems:this.selectedItems
                };
                return btn.disabled(ctx,btn);
            }
            return false;
        },
        showBtn(btn){
            if(btn.show===false){
                return false;
            }else if(_.isFunction(btn.show)){
                var ctx={
                    grid:this
                };
                return btn.show(ctx,btn);
            }
            return true;
        }
    },
    components:{
        advanceSearch:require("../advance_search")
    }
}