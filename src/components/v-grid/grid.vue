<style lang="scss">
    @import "../components.scss";
</style>
<template>
    <b-list  v-if="preprocessed" ref="listInst"
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
import { leapQueryConvertor } from "mvue-components";

import initByViewId from './js/init-by-viewid';
import metaservice from "../../services/meta/metaservice";
import gridBase from '../grid/grid-base';
export default {
    mixins: [gridBase],
    props: {
        "viewId": {//视图配置id，必须传入，所有视图配置数据、元数据信息都由这个参数获取
            type: String,
            required: true
        },
        query:{//数据加载方法，可以由外边重写掉
            type:Function,
            required:false
        },
        "filters": {//高级查询的条件和列表头部的筛选条件设置
            type: Object
        }
    },
    data:function(){
        return {
            entityName:null,
            formShortId:null,
            viewPath:null,
            editPath:null,
            createPath:null,
            defaultMetaViewFilters:'',//视图配置配置的默认查询字符串，leap格式
            
            innerToolbar:{
                hide: (this.toolbar&&this.toolbar.hide)||false,
                btns: this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.btns),//普通操作
                singleBtns:this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.singleBtns),//基于单条数据的操作
                batchBtns: this.convertToCommonOptIfNeeded(this.toolbar&&this.toolbar.batchBtns),//基于多条数据的操作
                rowSingleClick: (this.toolbar&&this.toolbar.rowSingleClick),//单击行的操作
                quicksearch:{
                    fields: null,
                    placeholder: this.toolbar&&this.toolbar.quicksearch&&this.toolbar.quicksearch.placeholder
                },
                advanceSearchFields:[]
            }
        };
    },
    watch:{
        viewId:{
            handler(){
                //获取视图配置数据
                metaservice().getViewByShortId({id: this.viewId}).then(({data:metaView}) => {
                    this.metaEntity = metabase.findMetaEntity(data.metaEntityName);
                    this.entityName = data.metaEntityName;
                    this.queryResource=this.metaEntity.dataResource();
                    this.formShortId = data.metaFormShortId;
                    //配置数据存在
                    if (metaView.config && metaView.config.columns) {
                        //初始化createPath、editPath、viewPath
                        initByViewId.initUrls(this,metaView);
                        initByViewId.initQuickSearch(this,metaView);
                        initByViewId.initAdvanceSearch(this,metaView);
                        initByViewId.initOrderBy(this,metaView);
                        this.defaultMetaViewFilters=metaView.config.filters||'';
                        initByViewId.initColumns(this,metaView);
                        this.preprocessed = true;
                    }else{//配置数据不存在，用元数据信息初始化
                        this.initGridByMetadata();
                    }
                });
            },
            immediate:true
        }
    },
    methods:{
        innerQuery(ctx){
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
                ctx.quicksearchKeyword=this.quicksearchKeyword;
            }//外部高级查询的查询条件自动在ctx里边，不需要特殊处理
            //1 如果有来自url查询条件的默认查询参数自动添加进去
            //2 如果有来自列header的查询条件也附加上去
            if(ctx.filters&&ctx.filters.rules){
                ctx.filters.rules=Object.assign(ctx.filters.rules,this.filtersFromQuery,this.filtersFromColumnHeader);
            }
            if(this.query){//外部指定了query，用外部的
                return this.query(ctx);
            }else{
                //默认存在元数据情况下，肯定是存在实体的queryResource的，而且是leap的后台，使用leap转换器
                return leapQueryConvertor.exec(this.queryResource,ctx,(params)=>{
                    //视图配置配置的默认查询字符串附加到查询filters中，leap格式
                    if(this.defaultMetaViewFilters){
                        params.filters=params.filters?`(${params.filters}) and ${this.defaultMetaViewFilters}`:`${this.defaultMetaViewFilters}`
                    }
                });
            }
        }
    }
}
</script>

