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
                :id="id"
                :query-resource="widgetContext.grid.queryResource"
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
            id:grid.id?`${grid.id}-batch-editor`:null,
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
            idInFilters:false,
            preprocessed:false
        }
    },
    methods:{
        handleBtnClick(){
            //如果原始列表是勾选过的，用当前勾选的行进行批量编辑
            let idInFilters=this.buildIdInFilters();
            if(idInFilters){
                this.idInFilters=idInFilters;
                this.showDrawer=true; 
                return;
            }else{
                this.idInFilters=false;
            }
            let grid=this.widgetContext.grid;
            let total=(grid.$refs.listInst&&grid.$refs.listInst.total)||0;
            if(total>1000){
                context.confirm({
                    title: '提示',
                    content: '当前数据超过1000条，是否继续进行批量编辑?',
                    onOk: () => {
                        this.showDrawer=true;
                    }
                });
            }else{
               this.showDrawer=true; 
            }
        },
        init(){
            let grid=this.widgetContext.grid;
            let quickSearch=_.cloneDeep(grid.innerToolbar.quickSearch);
            this.quickSearch=quickSearch;
            let queryOptions=null;
            if(this.idInFilters){
                queryOptions={filters:this.idInFilters};
            }else{
                queryOptions=this.buildQueryOptions();
            }
            this.queryOptions=queryOptions;
            this.preprocessed=true;
        },
        buildQueryOptions(){
            let grid=this.widgetContext.grid;
            let currentQueryParams=grid.currentQueryParams;
            return _.cloneDeep(currentQueryParams);
        },
        buildColumns(){
            let grid=this.widgetContext.grid;
            let gridColumns=grid.innerColumns;
            let _columns=[];
            let props=['tooltip']
            gridColumns.forEach(col => {
                let key=col.key;
                let metaField=grid.metaEntity.findField(key);
                if(metaField){
                    let _col={
                        key:col.key,
                        title:col.title,
                        hidden:col.hidden,
                        minWidth:250
                    };
                    props.forEach(prop => {
                        if(col[prop]){
                            _col[prop]=col[prop];
                        }
                    });
                    _columns.push(_col);
                }
            });
            return _columns;
        },
        buildIdInFilters(){
            let grid=this.widgetContext.grid;
            let selectedItems=grid.$refs.listInst&&grid.$refs.listInst.selectedItems;
            if(!_.isEmpty(selectedItems)){
                let idFieldName=grid.metaEntity.getIdField().name;
                let ids=[];
                selectedItems.forEach(item => {
                    ids.push(item[idFieldName]);
                });
                return `${idFieldName} in ${ids.join(",")}`;
            }else{
                return false;
            }
        }
    }
}
</script>


