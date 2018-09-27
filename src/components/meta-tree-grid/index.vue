<template>
    <Layout v-if="processed" class="com-wrapper" >
        <Sider hide-trigger class="tree-list-sidebar">
            <entity-tree :settings="treeSettings" @on-select-change="onTreeSelectChange"></entity-tree>
        </Sider>
        <Content>
            <meta-grid ref="gridList"  v-bind="$props" :query="innerQuery">
            </meta-grid>
        </Content>
    </Layout>
</template>

<script>
    import { leapQueryConvertor } from "mvue-components";
    import  gridProps from "../grid/js/grid-props";
    import treeService from "../../services/tool/tree-service";
    export default {
        mixins:[gridProps],
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
                            relationField:"",
                            entityName:""
                        }
                }
            }
        },
        data(){
            return {
                processed:false,
                selectedTreeNode:null
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
                _.assign(this.treeSettings,defaultTreeSetting);
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
                    var treeFilter=`${this.treeSettings.relationField} eq '${this.selectedTreeNode.id}'`;
                    if(_.isEmpty(queryParams.filters)){
                        queryParams.filters=treeFilter;
                    }else{
                        queryParams.filters=`(${queryParams.filters}) and (${treeFilter})`;
                    }
                });
            }
        },
        components:{
            entityTree:require("../entity-tree/index"),
            metaGrid:require("../grid/iview_grid")
        }
    }
</script>
