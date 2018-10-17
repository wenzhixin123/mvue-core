<template>
    <div>
        <!--直接跳转-->
        <div @click.stop.prevent="gotoPage" v-if="!operation.isPopup">
            <slot>
                <Button type="primary" size="small"
                        :title="operation.title" >
                    <Icon :type="operation.icon"></Icon>
                    {{operation.title}}
                </Button>
            </slot>
        </div>


        <!--打开新窗口模式-->
        <div @click.stop.prevent="toggleModal" v-if="operation.isPopup">
            <slot>
                <Button type="primary" size="small"
                        :title="operation.title" >
                    <Icon :type="operation.icon"></Icon>
                    {{operation.title}}
                </Button>
            </slot>
        </div>
        <Modal class="popup-widget-con" v-model="popupWidgetModal"
               :width="modalWidth"
               :title="modalTitle"
               :scrollable="true"
               :mask-closable="false"
        >
            <div class="modal-inner-widget" :style="{height:modalHeight+'px'}">
                <meta-widget-page :widget-params="pageParams"></meta-widget-page>
            </div>
            <div slot="footer"></div>
        </Modal>
    </div>
</template>
<script>
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
        if(!this.operation.page){
            this.$Modal.error({
                title:"错误",
                content:"page参数缺失"
            });
        }
        return {
            modalWidth:this.operation.modalWidth||500,
            modalHeight:this.operation.modalHeight||340,
            modalTitle:this.operation.page.title,
            popupWidgetModal:false,
            pageParams:{}
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
            return {dataId:id,entity:metaEntity.metaEntityId};

        },
        gotoPage(){
            if(!this.operation.page){
                return;
            }
            //所有跳转都带入dataId数据id,entity实体id
            var _query=_.extend({},this.getIdFromContext(),this.operation.queryParams);
            var pageId=this.operation.page.id;
            var _params=_.extend({pageId:pageId},this.operation.pathParams);
            router.push({name:"defaultPageIndex",query:_query,params:_params});
            this.$emit("triggered","toPage");
        },
        toggleModal(){
            if(!this.operation.page){
                return;
            }
            Object.assign(this.$route.query,this.getIdFromContext());
            this.pageParams = Object.assign({pageId:this.operation.page.id},this.getIdFromContext());
            this.popupWidgetModal=!this.popupWidgetModal;
            this.$emit("triggered","popup");
        },
        close(){//关闭对话框
            this.pageParams = {pageId :""};
            this.popupWidgetModal=false;
        }
    }
}
</script>

