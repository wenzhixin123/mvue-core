<template>
<div>
    <div @click="toggleModal">
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
                <component :widget-context="widgetContext" :operation="operation" :is="operation.widget">
                </component>
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
        return {
            modalWidth:this.operation.modalWidth||500,
            modalHeight:this.operation.modalHeight||340,
            modalTitle:this.operation.modalTitle,
            popupWidgetModal:false
        };
    },
    methods:{
        toggleModal(){
            this.popupWidgetModal=!this.popupWidgetModal;
        }
    }
}
</script>
<style lang="scss">
.popup-widget-con{
    .modal-inner-widget{
        overflow:auto;padding:5px;
    }
    .ivu-modal-footer{
        padding:0px;
        border:none;
    }
}
</style>


