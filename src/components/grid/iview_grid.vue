<template>
    <b-list  v-if="canRender" ref="listInst"
            :columns="innerColumns"
            :query="innerQuery"
            :toolbar="toolbar"
            :filters="filters"
            :default-sort="innerSort"

             :pager="pager"
             :page-size="pageSize"
             :page-size-opts="pageSizeOpts"
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
             :id="id"
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
             <template slot="top">
                <slot name="top">
                    <!-- 高级搜索区 -->
                </slot>
             </template>
             <template slot="header-left">
                <slot name="header-left">
                </slot>
             </template>
             <template slot="header-operations" v-if="innerToolbar.btns">
                <meta-operation  v-for="(btn,index) in innerToolbar.btns" v-if="index<btnSizeBeforeMore" :key="index"
                        :operation="btn"  :widget-context="getWidgetContext()" class="grid-primary-btn">
                        <Button slot-scope="{operation}" class="normal-btn"
                                :disabled="btnIsDisabled(operation)"
                                :type="operation.type?operation.type:'primary'"  :icon="operation.icon">{{operation.title}}</Button>
                </meta-operation>
                <Dropdown v-if="innerToolbar.btns.length>btnSizeBeforeMore" >
                    <Button>
                        更多操作
                        <Icon type="md-arrow-dropdown" />
                    </Button>
                    <DropdownMenu slot="list">
                        <DropdownItem v-for="(btn,index) in innerToolbar.btns" v-if="index>=btnSizeBeforeMore"
                                        :disabled="btnIsDisabled(btn)"
                                        :divided="btn.divided" :name="index" :key="index">
                            <meta-operation  :operation="btn" :widget-context="getWidgetContext()">
                                <div  slot-scope="{operation}" style="display: block">{{operation.title}}</div>
                            </meta-operation>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </template>
            <template slot="header-middle">
                <slot name="header-middle">
                </slot>
             </template>
            <template slot="header-quicksearch">
                <slot name="header-quicksearch">
                    <Input class="quicksearch-input" v-if="toolbar.quicksearch&&toolbar.quicksearch.fields" v-model="quicksearchKeyword" :placeholder="toolbar.quicksearch.placeholder" icon="search"/>
                </slot>
             </template>
            <template slot="header-right">
                <slot name="header-right">
                    <advance-search 
                        :quicksearch-keyword="quicksearchKeyword" 
                        v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0" 
                        :entity-name="entityName"
                        :advance-search-fields="innerToolbar.advanceSearchFields" 
                        @do-advance-search="doAdvanceSearch"></advance-search>
                </slot>
            </template>
    </b-list>
</template>
<script>
import metabase from '../../libs/metadata/metabase';
import initByMetadata from './js/init-by-metadata';
import gridBase from './js/grid-base';
export default {
    mixins: [gridBase],
    props: {
        "defaultSort": {//默认排序设置{key:'',order:'desc'}
            type: Object
        },
        "columns": {
            type: Array,
            required: false,
        },
        "entityName": {//元数据实体名称，由外部传入
            type: String,
            required:true
        },
        queryOptions:{//leap的固定查询参数
            type:Object,
            required:false
        },
        handleOnTitleClick:{//点击标题列处理函数
            type:[Function,Object,String],
            required:false
        },
        relation:{//关联列表会提供关系配置{refField:''}
            type:Object,
            required:false
        }
    },
    computed:{
        canRender(){
            //如果是关系列表，必须等待关联实体的数据写入core模块的store后才算初始化完成
            if(this.relation){
                return this.preprocessed&&this.refEntityId;
            }else{
                return this.preprocessed;
            }
        },
        refEntityId(){
            if(this.relation){
                let refField=this.relation.refField;
                let relationField=this.metaEntity.findField(refField);
                if(relationField&&relationField.manyToOneRelation){
                    let r=relationField.manyToOneRelation;
                    let targetEntity=r.targetEntity;
                    let refEntity=this.$store.getters['core/getEntity'](targetEntity);
                    if(refEntity){
                        let idField=this.$metaBase.findMetaEntity(targetEntity).getIdField().name;
                        return refEntity[idField];
                    }
                    return null;
                }
            }
            return null;
        }
    },
    data:function(){
        var metaEntity = metabase.findMetaEntity(this.entityName);
        return {
            metaEntity:metaEntity,
            queryResource:metaEntity.dataResource(),
            innerSort:_.cloneDeep(this.defaultSort),
            innerColumns:_.cloneDeep(this.columns),
        };
    },
    mounted:function(){
        this.initByMetadata();
    },
    methods:{
        //利用元数据信息填充grid相关属性
        initByMetadata(){
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
        //执行查询之前，附加leap query的固定查询参数
        beforeQuery(params){
            if(this.queryOptions){
                if(this.queryOptions.filters){
                    params.filters=params.filters?`(${params.filters}) and ${this.queryOptions.filters}`:`${this.queryOptions.filters}`
                }
                for(const key in this.queryOptions) {
                    //如果params中没有的key，用queryOptions的覆盖，否则以params的为准
                    if(key!="filters"&&this.queryOptions.hasOwnProperty(key)&&(!params.hasOwnProperty(key))) {
                        params[key]=this.queryOptions[key];
                    }
                }
            }
            //关系列表自动补充关系字段过滤条件
            let relationFilters=this.buildRelationFilters();
            if(relationFilters){
                params.filters=params.filters?`(${params.filters}) and ${relationFilters}`:`${relationFilters}`
            }
        },
        //暂时只处理多对一关系
        buildRelationFilters(){
            var _filters='';
            if(this.refEntityId){
                _filters=`${this.relation.refField} eq ${this.refEntityId}`;
            }
            return _filters;
        }
    }
}
</script>

