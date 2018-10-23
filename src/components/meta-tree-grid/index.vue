<template>
    <Layout v-if="processed" class="com-wrapper" >
        <Sider hide-trigger class="tree-list-sidebar">
            <meta-entity-tree v-if="realTreeSettings" v-bind="realTreeSettings" @on-select-change="onTreeSelectChange"></meta-entity-tree>
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
    import { leapQueryConvertor } from "mvue-components";
    import gridProps from "../grid/js/grid-props";
    import gridEvents from "../grid/js/grid-events";
    import treeService from "../../services/tool/tree-service";
    export default {
        mixins:[gridProps, gridEvents],
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
            }
        },
        data(){
            return {
                processed:false,
                selectedTreeNode:null,
                realTreeSettings:null
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
                return leapQueryConvertor.exec(queryResource,ctx,(queryParams)=>{
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
            }
        },
        components:{
            metaEntityTree:require("../entity-tree/index"),
            metaGrid:require("../grid/iview_grid")
        }
    }
</script>
