<template>
    <Layout v-if="processed" class="com-wrapper" >
        <Sider hide-trigger class="tree-list-sidebar">
            <Multiselect v-if="entityResource" style="margin-top:16px;"
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
            <meta-entity-tree ref="categoryTree" v-if="realTreeSettings" v-bind="realTreeSettings" @on-select-change="onTreeSelectChange"></meta-entity-tree>
        </Sider>
        <Content>
            <meta-grid ref="gridList"
                       v-bind="$props"
                       :query="innerQuery"
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
            </meta-grid>
        </Content>
    </Layout>
</template>

<script>
    import globalContext from '../../libs/context';
    import gridProps from "../grid/js/grid-props";
    import gridEvents from "../grid/js/grid-events";
    import treeService from "../../services/tool/tree-service";
    import entitySelect from '../form/mixins/entity-select';
    export default {
        mixins:[gridProps, gridEvents, entitySelect],
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
            },
            treeSettings:{  //树列表设置
                type:Object,
                default:function () {
                        return {
                            refField:"",//树查询条件对应的字段名
                            entityName:"",//树数据查询的实体名称
                            options:{}
                        }
                }
            },
            category:{
                type:Object,
                default(){
                    return {
                        entityName:'',//定义分类的数据来源实体名
                        url:'',//和entityName二选一
                        fieldName:'',//用来过滤树数据的字段，来源于treeSettings定义的entityName实体的字段，用于树数据的分类过滤
                        valField:'',//可指定树分类的key字段
                        titleField:'',//可指定树分类的显示字段,
                        searchFields:[], //树分类的搜索字段
                        placeholder:'请输入关键字搜索'
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
            }
        },
        data(){
            this.preInitCategory();
            return {
                processed:false,
                selectedTreeNode:null,
                realTreeSettings:null,
                entityResource:this.category&&this.category.entityResource,
                oldTreeFilters:(this.treeSettings.options&&this.treeSettings.options.queryOptions)?_.cloneDeep(this.treeSettings.options.queryOptions.filters):''
            }
        },
        mounted:function () {
            this.processSettings();
            this.processed=true;
        },
        methods:{
            processSettings:function () {
                //对setting进行预处理
                var defaultTreeSetting=treeService.build(this.treeSettings.entityName,this.treeSettings.options);
                this.realTreeSettings=defaultTreeSetting;
            },
            onTreeSelectChange:function (data) {
                if(data && data.length>0){
                    this.selectedTreeNode=data[0];
                }else{
                    this.selectedTreeNode=null;
                }
                this.$refs["gridList"].reload();
            },
            innerQuery(ctx,queryResource){
                return globalContext.getMvueComponents().leapQueryConvertor.exec(queryResource,ctx,(queryParams)=>{
                    this.$refs.gridList.beforeQuery&&this.$refs.gridList.beforeQuery(queryParams);
                    if(this.selectedTreeNode==null){
                        return ;
                    }
                    var treeFilter=`${this.treeSettings.refField} eq '${this.selectedTreeNode.id}'`;
                    if(_.isEmpty(queryParams.filters)){
                        queryParams.filters=treeFilter;
                    }else{
                        queryParams.filters=`(${queryParams.filters}) and (${treeFilter})`;
                    }
                });
            },
            preInitCategory(){
                if(this.category){
                    if(_.isUndefined(this.category.searchFields) || this.category.searchFields==null){
                        this.category.searchFields=[];
                    }
                    if(this.category.entityName){//通过实体名构造数据源
                        let metaEntity=this.$metaBase.findMetaEntity(this.category.entityName);
                        if(metaEntity){
                            if(_.isEmpty(this.category.valField)){
                                this.category.valField=metaEntity.getIdField().name;
                            }
                            let tf=metaEntity.firstTitleField();
                            if(tf){
                                if(_.isEmpty(this.category.titleField)){
                                    this.category.titleField=tf.name;
                                }
                                if(this.category.searchFields.length==0 && tf.filterable){
                                    this.category.searchFields.push(tf.name);
                                }
                            }
                            this.category.entityResource=metaEntity.dataResource();
                            if(_.isEmpty(this.category.placeholder)){
                                this.category.placeholder=`按${metaEntity.title}过滤`;
                            }
                        }else{
                            this.$Modal.error({content:`实体[${this.category.entityName}]不存在`});
                            return;
                        }
                    }else if(this.category.url){//通过url地址构造数据源
                        this.category.entityResource=globalContext.buildResource(this.category.url);
                    }
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
            onCategoryChange(){
                if(!this.treeSettings.options.queryOptions){
                    this.treeSettings.options.queryOptions={};
                }
                //附加分类的条件
                if(this.selectedItem&&this.category.fieldName){
                    let id=this.selectedItem[this.getIdField()];
                    let categoryFilter=`${this.category.fieldName} eq '${id}'`;
                    if(this.oldTreeFilters){
                        this.treeSettings.options.queryOptions.filters=`${this.oldTreeFilters} and ${categoryFilter}`;
                    }else{
                        this.treeSettings.options.queryOptions.filters=categoryFilter;
                    }
                }else{
                    this.treeSettings.options.queryOptions.filters=this.oldTreeFilters;
                }
                var defaultTreeSetting=treeService.build(this.treeSettings.entityName,this.treeSettings.options);
                this.realTreeSettings=defaultTreeSetting;
                this.$refs.categoryTree.buildRoot();
            }
        },
        components:{
            metaEntityTree:require("../entity-tree/index"),
            metaGrid:require("../grid/iview_grid")
        }
    }
</script>
