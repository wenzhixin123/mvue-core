<template>
    <b-list  v-if="canRender()" ref="listInst"
             :columns="innerColumns"
             :query="innerQuery"
             :toolbar="toolbar"
             :filters="filters"
             :default-sort="innerSort"
             :cur-page="curPage"
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
             @on-select-all-cancel="handleOnSelectAllCancel"
             @on-selection-change="handleOnSelectionChange"
             @on-sort-change="handleSortChange"
             @on-filter-change="handleOnFilterChange"
             @on-row-click="handleOnRowClick"
             @on-row-dblclick="handleOnRowDblclick"
             @on-expand="handleOnExpand">
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
                                :type="operation.btnType||'primary'"  :icon="operation.icon">{{operation.title}}</Button>
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
                    <Input class="quicksearch-input" search  v-if="toolbar.quicksearch&&toolbar.quicksearch.fields"
                           v-model="quicksearchKeyword" @on-search="reload"
                           :placeholder="toolbar.quicksearch.placeholder"  />
                    <advance-search ref="advanceSearchRef"
                            :quicksearch-keyword="quicksearchKeyword"
                            :quicksearch="toolbar.quicksearch"
                            :init-model="advanceSearchInitModel"
                            v-if="innerToolbar.advanceSearchFields&&innerToolbar.advanceSearchFields.length>0"
                            :entity-name="entityName"
                            :advance-search-fields="innerToolbar.advanceSearchFields"
                            @do-advance-search="doAdvanceSearch"></advance-search>
                </slot>
             </template>
            <template slot="header-right">
                <slot name="header-right">
                </slot>
            </template>
    </b-list>
</template>
<script>
import metabase from '../../libs/metadata/metabase';
import initByMetadata from './js/init-by-metadata';
import gridBase from './js/grid-base';
import gridEvents from './js/grid-events';
import getParent from '../mixins/get-parent';
export default {
    mixins: [gridBase, gridEvents, getParent],
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
        relation:{//关联列表会提供关系配置，如多对一关系示例：{refField:'orgId'}或者{sourceEntityName:'organization',name:"users"}，多对多关系：{sourceEntityName:'organization',name:"users"}
            type:Object,
            required:false
        },
        maxColumnsSize:{//默认生成列时，列表最多显示的列数
            type:Number,
            required:false
        },
        createParams:{//grid创建操作可使用的外部指定的查询参数，由m-tree-grid传入，create操作使用
            type:Object,
            required:false
        }
    },
    data:function(){
        this.setXAccessModeIfNecessary();
        var metaEntity = metabase.findMetaEntity(this.entityName);
        var qr=this.ifOneToManyGrid()?this.buildOneToManyGridQueryResource():metaEntity.dataResource();
        var saveStatusKey=this.id||`${this.$route.matched[this.$route.matched.length-1].path}-${this.entityName}`;
        var ctx=this.$store.getters['core/gridStatus'][saveStatusKey]||{};
        return {
            metaEntity:metaEntity,
            queryResource:qr,
            innerSort:ctx.sort||_.cloneDeep(this.defaultSort),
            innerColumns:_.cloneDeep(this.columns),
            curPage:ctx.currentPage||1,
            quicksearchKeyword:ctx.quicksearchKeyword||'',
            saveStatusKey:saveStatusKey,
            advanceSearchInitModel:ctx.advModel||null,
            advanceSearchFilters:ctx.advanceSearchFilters||[]
        };
    },
    //保存一下当前grid的状态到vuex，页码、快捷查询条件、排序等
    beforeDestroy(){
        var currentQueryCtx=_.cloneDeep(this.currentQueryCtx);
        if(this.$refs.advanceSearchRef){
            currentQueryCtx.advModel=this.$refs.advanceSearchRef.model;
            currentQueryCtx.advanceSearchFilters=this.advanceSearchFilters;
        }
        this.$store.commit('core/keepGridStatus',{key:this.saveStatusKey,ctx:currentQueryCtx});
    },
    mounted:function(){
        this.initByMetadata();
    },
    methods:{
        setXAccessModeIfNecessary(){
            if(this.xAccessMode){
                this.$store.commit('core/setXAccessMode',this.xAccessMode);
            }
        },
        buildOneToManyGridQueryResource(){
            let sourceMetaEntity=this.$metaBase.findMetaEntity(this.relation.sourceEntityName);
            //这里返回的是以关系命名的方法对象，而不是原始的查询对象
            return sourceMetaEntity.dataResource()[this.relation.name];
        },
        ifOneToManyGrid(){//是否一对多关系列表
            var relationName=this.relation&&this.relation.name;
            if(relationName){
                let sourceEntityName=this.relation.sourceEntityName;
                if(!sourceEntityName){
                    return false;
                }
                let sourceMetaEntity=this.$metaBase.findMetaEntity(sourceEntityName);
                let relation=sourceMetaEntity.relations[relationName];
                if(relation.type=="one-to-many"){
                    return true;
                }
            }
            return false;
        },
        //利用元数据信息填充grid相关属性
        initByMetadata(){
            //如果外部没有指定默认排序，则使用实体更新时间字段作为默认排序
            if(!this.innerSort){
                this.innerSort=initByMetadata.buildDefaultOrderby(this);
            }
            //如果有来自查询条件的默认过滤器初始化
            var filtersFromQuery={};
            //弹出框不读取query参数
            if(!this.getParentPopup()){
                filtersFromQuery=initByMetadata.buildFiltersFromQuery(this);
            }
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
            //将需要expand的字段添加到查询参数中
            let _fields=[];
            _.each(this.innerColumns,c=>{
                if(c.key){
                    _fields.push(c.key);
                }
            });
            let _expand=this.metaEntity.getExpand(_fields);
            if(_expand){
                params.expand=_expand;
            }
            if(this.relation){
                this.fillParamsWithRelation(params);
            }
        },
        //对于多对一关系和多对多关系，自动添加相关查询参数
        fillParamsWithRelation(params){
            var relationName=this.relation.name;
            if(this.ifOneToManyGrid()){
                let sourceEntityName=this.relation.sourceEntityName;
                let sourceMetaEntity=this.$metaBase.findMetaEntity(sourceEntityName);
                //父实体的数据
                let refEntity=this.$store.state.core.currentRouteData[sourceEntityName];
                let idField=sourceMetaEntity.getIdField().name;
                params['parentEntityId']=refEntity[idField];
            }else if(this.relation.refField){//多对一关系，根据指定的字段找到关系过滤条件
                let relationFilters=this.buildRelationFilters();
                if(relationFilters){
                    params.filters=params.filters?`(${params.filters}) and ${relationFilters}`:`${relationFilters}`
                }
            }
        },
        //暂时只处理多对一关系
        buildRelationFilters(){
            var _filters='';
            if(this.refEntityId()){
                _filters=`${this.relation.refField} eq ${this.refEntityId()}`;
            }
            return _filters;
        },
        refEntityId(){
            if(this.relation){
                let refField=this.relation.refField;
                let relationField=this.metaEntity.findField(refField);
                if(relationField&&relationField.manyToOneRelation){
                    let r=relationField.manyToOneRelation;
                    let targetEntity=r.targetEntity.toLowerCase();
                    let refEntity=this.$store.state.core.currentRouteData[targetEntity];
                    if(refEntity){
                        let idField=this.$metaBase.findMetaEntity(targetEntity).getIdField().name;
                        return refEntity[idField];
                    }
                    return null;
                }
            }
            return null;
        },
        canRender(){
            //如果是关系列表，必须等待关联实体的数据写入core模块的store后才算初始化完成
            if(this.relation){
                if(this.ifOneToManyGrid()){
                    return this.$store.state.core.currentRouteData[this.relation.sourceEntityName]&&this.preprocessed;
                }else{
                    return this.refEntityId()&&this.preprocessed;
                }
            }else{
                return this.preprocessed;
            }
        }
    }
}
</script>

