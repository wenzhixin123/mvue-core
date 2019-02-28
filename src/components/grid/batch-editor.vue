<template>
    <div>
        <div @click="handleBtnClick" style="width:100%;">
            <slot>
                <Button type="primary"  :icon="operation.icon">{{operation.title}}</Button>
            </slot>
        </div>
        <Drawer
            :title="operation.title+'-'+metaEntity.title"
            v-model="showDrawer"
            :width="100"
            :mask-closable="false"
            :styles="styles"
            class="grid-drawer-con"
        >
            <m-batch-editor v-if="preprocessed"
                :default-sort="defaultSort"
                :query-options="queryOptions"
                :filters="filters"
                :quick-search="quickSearch"
                :columns="columns"
                :entity-name="entityName" style="height: calc(100% - 55px); overflow: auto;"></m-batch-editor>
            <div class="drawer-footer">
                <Button @click="showDrawer = false">关闭</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
import context from "../../libs/context";
export default {
    props:{
        operation:{
            type:Object,
            required:true
        },
        widgetContext:{
            type:Object,
            required:true
        }
    },
    watch:{
        showDrawer(){
            if(this.showDrawer){
                this.init();
            }else{
                this.preprocessed=false;
                this.widgetContext.grid.reload();
            }
        }
    },
    data:function(){
        let grid=this.widgetContext.grid;
        let entityName=grid.metaEntity.name;
        let columns=this.buildColumns();
        return {
            showDrawer:false,
            styles:{
                height: 'calc(100% - 55px)',
                overflow: 'hidden'
            },
            columns:columns,
            metaEntity:grid.metaEntity,
            entityName:entityName,
            quickSearch:null,
            filters:null,
            queryOptions:null,
            defaultSort:null,
            preprocessed:false
        }
    },
    methods:{
        handleBtnClick(){
            this.showDrawer=true;
        },
        init(){
            let grid=this.widgetContext.grid;
            let queryCtx=grid.currentQueryCtx;
            let quickSearch=_.cloneDeep(grid.innerToolbar.quickSearch);
            let filters=_.cloneDeep(queryCtx.filters);
            let queryOptions=this.buildQueryOptions();
            this.quickSearch=quickSearch;
            this.filters=filters;
            this.queryOptions=queryOptions;
            this.defaultSort=grid.innerSort;
            this.preprocessed=true;
        },
        buildQueryOptions(){
            let grid=this.widgetContext.grid;
            let queryOptions=_.cloneDeep(grid.queryOptions)||{filters:''};
            let queryCtx=grid.currentQueryCtx;
            let quicksearchFields=queryCtx.quicksearchFields;
            let quicksearchKeyword=queryCtx.quicksearchKeyword;
            if(quicksearchKeyword&&!_.isEmpty(quicksearchFields)){
                //默认将逗号和空格，当成多个关键字的分隔符
                let keywords=quicksearchKeyword.split(/[,，\s]/);
                let qsFilters=[],leapFilter="";
                keywords.forEach( keyword => {
                    _.each(quicksearchFields, function (sField) {
                        let _keyword=context.getMvueToolkit().utils.leapQueryValueEncode(keyword);
                        qsFilters.push(`${sField} like '%${_keyword}%'`);
                    });
                });
                leapFilter=qsFilters.join(" or ");
                if(queryOptions.filters){
                    queryOptions.filters=`${queryOptions.filters} and (${leapFilter})`;
                }else{
                    queryOptions.filters=`(${leapFilter})`;
                }
            }
            return queryOptions;
        },
        buildColumns(){
            let grid=this.widgetContext.grid;
            let gridColumns=grid.innerColumns;
            let _columns=[];
            gridColumns.forEach(col => {
                let key=col.key;
                let metaField=grid.metaEntity.findField(key);
                if(metaField){
                    _columns.push(_.cloneDeep(col));
                }
            });
            return _columns;
        }
    }
}
</script>


