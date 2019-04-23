<template>
    <Layout v-if="processed" class="com-wrapper tree-list" >
        <Sider hide-trigger class="tree-list-sidebar">
            <Multiselect v-if="entityResource" style="margin-top:0px;"
                :multiple="false" v-model="selectedItem"
                :options="dataItems"
                :placeholder="category.placeholder"
                :loading="isLoading"
                select-label="按enter键选择"
                selected-label="已选"
                deselect-label="按enter键取消选择"
                :show-no-results="true"
                :internal-search="false"
                :label="getTitleField()"
                :allowEmpty="!category.mustSelect"
                :deselectLabel="deselectLabel"
                @search-change="searchChange"
                @input="onCategoryChange"
                :track-by="getIdField()">
                <template slot="option" slot-scope="props">
                    <div class="option__desc">
                        <span class="option__title">{{ props.option[getTitleField()] }}</span>
                    </div>
                </template>
                <template slot="noResult">
                    根据关键字，搜索不到任何数据
                </template>
                <template slot="noOptions">
                    无数据
                </template>
            </Multiselect>
            <div class="menu-title" v-if="treeSettings && treeSettings.title">{{treeSettings.title}}</div>
            <meta-entity-tree ref="categoryTree"
                              v-bind="realTreeSettings"
                              :load-data-when-mount="loadDataWhenMount"
                              @on-select-change="onTreeSelectChange"
            ></meta-entity-tree>
        </Sider>
        <Content>
            <meta-grid ref="gridList"
                       v-bind="gridSettings"
                       :query="innerQuery"
                       :create-params="createParams"
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
                       @on-row-delete="handleOnRowDelete"
                       @on-expand="handleOnExpand">
            </meta-grid>
        </Content>
    </Layout>
</template>

<script>
    import globalContext from '../../libs/context';
    import gridProps from "../grid/js/grid-props";
    import mGridProps from '../grid/js/m-grid-props';
    import gridEvents from "../grid/js/grid-events";
    import treeService from "../../services/tool/tree-service";
    import entitySelect from '../form/mixins/entity-select';
    import topEntityService from "../../services/store/top-entity";

    export default {
        mixins:[mGridProps,gridProps, gridEvents, entitySelect],
        props: {
            treeSettings:{  //树列表设置，targetField树查询条件对应的字段名，entityName树数据查询的实体名称
                type:Object,
                required:true,
                validator(value){
                    return value &&
                           value.targetField &&
                           value.entityName;
                },
                default(){
                    return {
                        entityName:"",
                        mustSelect: false,
                        topEntity: false    //支持将选中值设置成topEntity
                    }
                }
            },
            category:{
                type:Object,
                default(){
                    return {
                        entityName:'',//定义分类的数据来源实体名
                        url:'',//和entityName二选一
                        targetField:'',//用来过滤树数据的字段，来源于treeSettings定义的entityName实体的字段，用于树数据的分类过滤
                        valField:'',//可指定树分类的key字段
                        titleField:'',//可指定树分类的显示字段,
                        searchFields:[], //树分类的搜索字段
                        placeholder:'请输入关键字搜索',
                        mustSelect:false,   //必须有选中值
                        topEntity: false    //支持将选中值设置成topEntity
                    };
                }
            }
        },
        computed:{
            categoryPlaceHolder(){
                if(this.category.placeholder){
                    return this.category.placeholder;
                }
                return "请输入关键字搜索";
            },
            loadDataWhenMount(){
              if(this.isCategoryEnable() && this.category.mustSelect){
                  return false;
              }
              return true;
            },
            createParams(){
                let params={};
                if(this.selectedTreeNode){
                    params[this.treeSettings.targetField]=this.selectedTreeNode.id;
                }
                return params;
            },
            gridSettings(){
                let loadDataWhenMount=this.loadDataWhenMount;
                if(this.treeSettings.mustSelect){
                    loadDataWhenMount=false;
                }
                return _.assign(this.$props,{
                    loadDataWhenMount:loadDataWhenMount
                });
            },
            deselectLabel(){
                if(this.category.mustSelect){
                    return ""
                }
                return "按enter键取消选择"
            }
        },
        data(){
            var entitySelectInited=false;
            if(this.isCategoryEnable()){
                this.preInitCategory();
                if(!this.category.topEntity){
                    entitySelectInited=true;
                }
            }else{
                entitySelectInited=true;
            }
            return {
                processed:false,
                entitySelectInited:entitySelectInited,
                selectedTreeNode:null,
                realTreeSettings:null,
                preselectFirst:this.category&&this.category.mustSelect,
                entityResource:this.category&&this.category.entityResource,
                oldTreeFilters:(this.treeSettings.queryOptions)?_.cloneDeep(this.treeSettings.queryOptions.filters):''
            }
        },
        mounted:function () {
            this.processSettings();
            this.processed=true;
        },
        methods:{
            handleOnRowDelete(ids){
                //如果当前tree和grid数据来源于同一个实体，则删除grid数据，tree也要刷新
                if(this.treeSettings.entityName==this.entityName){
                    this.$refs.categoryTree.buildRoot();
                }
            },
            canTreeRender(){
                if(this.entitySelectInited && this.realTreeSettings){
                    return true;
                }
                return false;
            },
            canGridRender(){
                return this.entitySelectInited;
            },
            onEntitySelectInited(items){
              this.entitySelectInited=true;
              this.onCategoryChange(items);
            },
            entitySelectInitialValue(){
                if(this.isCategoryEnable()){
                    let topEntity=topEntityService.getHistory(this.category.entityName);
                    if(topEntity){
                        if(this.category.topEntity){
                            topEntityService.set(topEntity.entityName,topEntity.value);
                        }
                        return topEntity.value;
                    }
                }
                return null;
            },
            processSettings:function () {
                //对setting进行预处理
                var defaultTreeSetting=treeService.build(this.treeSettings.entityName,this.treeSettings);
                this.realTreeSettings=defaultTreeSetting;
            },
            onTreeSelectChange:function (data) {
                if(data && data.length>0){
                    this.selectedTreeNode=data[0];
                }else{
                    this.selectedTreeNode=null;
                }

                //设置topEntity
                if(this.treeSettings.topEntity && this.treeSettings.entityName){
                    if(data && data.length>0){
                        topEntityService.set(this.treeSettings.entityName,this.selectedTreeNode.id);
                    }else{
                        topEntityService.remove();
                    }
                }
                this.$refs["gridList"].reload();
            },
            innerQuery(ctx,queryResource){
                return globalContext.getMvueComponents().leapQueryConvertor.exec(queryResource,ctx,(queryParams)=>{
                    this.$refs.gridList.beforeQuery&&this.$refs.gridList.beforeQuery(queryParams);
                    if(this.selectedTreeNode==null){
                        this.$refs.gridList.currentQueryParams=_.cloneDeep(queryParams);
                        return ;
                    }
                    var treeFilter=`${this.treeSettings.targetField} eq '${this.selectedTreeNode.id}'`;
                    if(_.isEmpty(queryParams.filters)){
                        queryParams.filters=treeFilter;
                    }else{
                        queryParams.filters=`(${queryParams.filters}) and (${treeFilter})`;
                    }
                    //每次查询记录最终的查询filters
                    this.$refs.gridList.currentQueryParams=_.cloneDeep(queryParams);
                });
            },
            getTreeFilterParam(){
                if(this.selectedTreeNode==null){
                    return ;
                }
                return {
                    key:this.treeSettings.targetField,
                    value:this.selectedTreeNode.id
                }
            },
            isCategoryEnable(){
              if(this.category && (this.category.entityName || this.category.url)){
                  return true;
              }
              return false;
            },
            preInitCategory() {
                if (_.isUndefined(this.category.searchFields) || this.category.searchFields == null) {
                    this.category.searchFields = [];
                }
                if (this.category.entityName) {//通过实体名构造数据源
                    let metaEntity = this.$metaBase.findMetaEntity(this.category.entityName);
                    if (metaEntity) {
                        if (_.isEmpty(this.category.valField)) {
                            this.category.valField = metaEntity.getIdField().name;
                        }
                        let tf = metaEntity.firstTitleField();
                        if (tf) {
                            if (_.isEmpty(this.category.titleField)) {
                                this.category.titleField = tf.name;
                            }
                            if (this.category.searchFields.length == 0 && tf.filterable) {
                                this.category.searchFields.push(tf.name);
                            }
                        }
                        this.category.entityResource = metaEntity.dataResource();
                        if (_.isEmpty(this.category.placeholder)) {
                            this.category.placeholder = `按${metaEntity.title}过滤`;
                        }
                    } else {
                        this.$Modal.error({content: `实体[${this.category.entityName}]不存在`});
                        return;
                    }
                } else if (this.category.url) {//通过url地址构造数据源
                    this.category.entityResource = globalContext.buildResource(this.category.url);
                }
            },
            buildQueryOptions(params,keyword){
                if(_.isEmpty(this.category.searchFields) || _.isEmpty(keyword)){
                    return;
                }
                var filters=[];
                var encodeKeyword=globalContext.getMvueToolkit().utils.leapQueryValueEncode(keyword);
                _.each(this.category.searchFields,(val,index)=>{
                    filters.push(`(${val} like '%${encodeKeyword}%')`);
                });
                 params.filters=filters.join(" or ");
            },
            getIdField(){
                if(this.category){
                    if(this.category.valField){
                        return this.category.valField;
                    }
                }
                return "id";
            },
            getTitleField(){
                if(this.category){
                    if(this.category.titleField){
                        return this.category.titleField;
                    }
                }
                return "name";
            },
            onCategoryChange(value,id){
                if(!this.isCategoryEnable() || !this.entitySelectInited){
                    return;
                }
                if(!this.treeSettings.queryOptions){
                    this.treeSettings.queryOptions={};
                }
                //附加分类的条件
                let _treeSettings=_.cloneDeep(this.treeSettings);
                if(this.selectedItem&&this.category.targetField){
                    let id=this.selectedItem[this.getIdField()];
                    let categoryFilter=`${this.category.targetField} eq '${id}'`;
                    if(this.oldTreeFilters){
                        _treeSettings.queryOptions.filters=`${this.oldTreeFilters} and ${categoryFilter}`;
                    }else{
                        _treeSettings.queryOptions.filters=categoryFilter;
                    }
                }else{
                    _treeSettings.queryOptions.filters=this.oldTreeFilters;
                }
                var defaultTreeSetting=treeService.build(this.treeSettings.entityName,_treeSettings);
                this.realTreeSettings=defaultTreeSetting;
                this.$nextTick(()=>{
                    if(this.$refs.categoryTree){
                        //快速切换时，报错
                        this.$refs.categoryTree.buildRoot();
                        if(this.category.topEntity){
                            if(this.selectedItem){
                                let id=this.selectedItem[this.getIdField()];
                                topEntityService.set(this.category.entityName,id);
                            }else{
                                topEntityService.remove();
                            }
                            this.$refs["gridList"].reload();
                        }
                    }
                });
            }
        },
        components:{
            metaEntityTree:require("../entity-tree/index"),
            metaGrid:require("../grid/iview_grid")
        }
    }
</script>
