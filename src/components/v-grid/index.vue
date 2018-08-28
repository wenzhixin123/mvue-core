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

import initByViewId from './init-by-viewid';
import metaservice from "../../services/meta/metaservice";
import gridBase from '../grid/js/grid-base';
export default {
    mixins: [gridBase],
    props: {
        "viewId": {//视图配置id，所有视图配置数据、元数据信息都由这个参数获取
            type: String,
            required: false
        },
        "metaView":{//直接传入的视图配置数据，和viewId二选一
            type:Object,
            required:false
        }
    },
    data:function(){
        if((!this.viewId) && (!this.metaView)){
            this.$Modal.error({
                content:"viewId或metaView属性必须二选一"
            });
            return {};
        }else if(this.metaView&&(!this.metaView.metaEntityName)){
            this.$Modal.error({
                content:"metaView必须指定metaEntityName属性"
            });
            return {};
        }
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
                //后端获取视图配置数据
                if(this.viewId){
                    metaservice().getViewByShortId({id: this.viewId}).then(({data:metaView}) => {
                        this.initByMetaView(metaView);
                    });
                }
            },
            immediate:true
        },
        metaView:{
            handler(){
                //属性传入的视图配置数据metaView
                if(this.metaView){
                    this.initByMetaView(this.metaView);
                }
            },
            immediate:true
        }
    },
    methods:{
        initByMetaView(metaView){
            this.metaEntity = metabase.findMetaEntity(metaView.metaEntityName);
            this.entityName = metaView.metaEntityName;
            this.queryResource=this.metaEntity.dataResource();
            this.formShortId = metaView.metaFormShortId;
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
                this.$Modal.error({
                    content:"视图配置数据不合法，缺少columns配置"
                });
            }
        },
        beforeQuery(params){
            //视图配置配置的默认查询字符串附加到查询filters中，leap格式
            if(this.defaultMetaViewFilters){
                params.filters=params.filters?`(${params.filters}) and ${this.defaultMetaViewFilters}`:`${this.defaultMetaViewFilters}`
            }
        }
    }
}
</script>

