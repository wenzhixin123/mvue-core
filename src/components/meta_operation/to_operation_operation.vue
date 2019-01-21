<template>
    <div>
        <!--直接跳转-->
        <div @click.stop.prevent="gotoPage">
            <slot>
                <Button type="primary" size="small"
                        :title="operation.title" >
                    <Icon :type="operation.icon"></Icon>
                    <img v-if="!operation.hideImg" width="16" height="16" :src="mVueToolkit.config.getUploadUrl()+'?filePath='+operation.icon" @error="hideImg(operation)">
                    {{operation.title}}
                </Button>
            </slot>
        </div>
    </div>
</template>
<script>
    import OperationUtils from './js/operation_utils';
    import mVueToolkit from "mvue-toolkit";
    export default {
        props:{
            widgetContext:{//由使用操作的部件传入的部件上下文
                type:Object,
                required:true
            },
            operation:{//操作的定义，必传参数
                type:Object,
                required:true
            }
        },
        data(){
            /*if(!this.operation.operationId){
                this.$Modal.error({
                    title:"错误",
                    content:"page参数缺失"
                });
            }*/
            return {
                pageParams:{},
                mVueToolkit:mVueToolkit
            };
        },
        methods:{
            getIdFromContext(){
                var context = Object.assign(this.widgetContext, this.operation);
                var id = context.selectedId;
                var metaEntity = context.metaEntity;
                if(!context.selectedItem&&context.selectedItems&&context.selectedItems.length){
                    //按钮放置的是在工具栏
                    context.selectedItem = context.selectedItems[(context.selectedItems.length-1)]
                    context.selectedId = context.selectedItem.id;
                    id = context.selectedId;
                }
                if (!id&&context.selectedItem) {
                    var selectedItem = context.selectedItem;
                    if (selectedItem) {
                        //计算id字段
                        var idField = null;
                        if (!_.isEmpty(metaEntity)) {
                            idField = metaEntity.getIdField();
                        }
                        id = selectedItem[idField];
                    }
                }//获取传入的对象id和实体信息
                return {dataId:id,entityId:metaEntity.metaEntityId};

            },
            gotoPage(){
                let _t = this;
                var _widgetCtx = Object.assign(this.widgetContext, {"buttonInfo":this.operation});
                OperationUtils.execution(this.operation,_widgetCtx,"beforeExecCode",this).then((res)=>{
                    //所有跳转都带入dataId数据id,entity实体id
                    var _query=_.extend({byOperation:true}/*,_t.getIdFromContext(),_t.operation.queryParams*/);
                    var pageId=_t.operation.operationId;
                    var _params=_.extend({pageId:pageId,byOperation:true},_t.operation.pathParams);
                    OperationUtils.setUrlParam(this.operation,this);//按钮输入参数处理
                    OperationUtils.execution(this.operation,_widgetCtx,"afterExecCode",this)//执行后
                    router.push({name:"defaultPageIndex",query:_query,params:_params});
                    _t.$emit("triggered","toPage");
                });
            },
            hideImg(operation){
                //隐藏图片
                operation.hideImg=true;
                this.$forceUpdate();
            }
        }
    }
</script>

