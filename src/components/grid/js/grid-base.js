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
                advanceSearchFields:(this.toolbar&&this.toolbar.advanceSearchFields)||[]
            },
            selectedItems:[],//已经选择的数据
            quicksearchKeyword:"",//内部高级查询提供的快捷搜索词
            advanceSearchFilters:[],//内部高级查询设置的查询条件
            changedQueue:[],
            currentQueryCtx:{}//当前查询的所有上下文参数对象
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
                        value:asf.value
                    };
                });
                ctx.filters=useInnerAdvSearchFilters;
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
                ctx.filters.rules=Object.assign(ctx.filters.rules,this.filtersFromQuery,this.filtersFromColumnHeader);
            }
            //保存当前查询的上下文参数对象
            this.currentQueryCtx=ctx;
            if(this.query){//外部指定了query，用外部的
                return this.query(ctx,this.queryResource);
            }else{
                //默认存在元数据情况下，肯定是存在实体的queryResource的，而且是leap的后台，使用leap转换器
                return globalContext.getMvueComponents().leapQueryConvertor.exec(this.queryResource,ctx,(params)=>{
                    this.beforeQuery&&this.beforeQuery(params);
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
                this.reload();
            },"changedQueue",delay);
        },
        reload:function () {
            this.$refs.listInst.doReload();
        },
        //高级查询
        doAdvanceSearch(advanceSearchFilters,quicksearchKeyword){
            this.quicksearchKeyword=quicksearchKeyword||"";
            this.advanceSearchFilters=advanceSearchFilters;
            this.reload();
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
                    grid: $.extend(_self, {checked: _self.selectedItems}),
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
        wrapBtns(btns){
          return operationManager.batchCreate(btns);
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
    },
    components:{
        advanceSearch:require("../advance_search")
    }
}