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
            <div class="modal-inner-widget" :style="{height:modalHeight+'px'}" v-if="popupWidgetModal">
                <component v-if="!isMetaLayout()" @popup-close="close" :widget-context="widgetContext" :operation="operation" :is="operation.widget">
                </component>
                <meta-layout v-if="isMetaLayout()" :settings="metaLayoutSettings()" @popup-close="close">
                </meta-layout>
            </div>
            <div slot="footer" :id="footerDomId"></div>
    </Modal>
</div>
</template>
<script>
import metaLayoutConvertor from '../meta-layout/layout-convertor';
const uuidv1 = require('uuid/v1');
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
        let footerDomId='footerid-'+uuidv1();
        return {
            modalWidth:this.operation.modalWidth||750,
            modalHeight:this.operation.modalHeight||380,
            modalTitle:this.operation.modalTitle||this.operation.title,
            popupWidgetModal:false,
            footerDomId:footerDomId,
            isPopup:true
        };
    },
    methods:{
        toggleModal(){
            this.popupWidgetModal=!this.popupWidgetModal;
            this.$emit("triggered","popup");
        },
        close(){//关闭对话框
            this.popupWidgetModal=false;
            if(this.widgetContext.grid){
                this.widgetContext.grid.reload();
            }
        },
        isMetaLayout(){
            var widget=this.operation.widget;
            if(_.startsWith(widget,"/pages/")){
                return true;
            }
            return false;
        },
        metaLayoutSettings(){
            var widget=this.operation.widget;
            var autoPageConfs=this.$store.getters['core/autoPageConfs'];
            var settings=autoPageConfs[widget];
            settings= metaLayoutConvertor.convert(settings);
            return settings.layout;
        }
    }
}
</script>
<style lang="scss">
.popup-widget-con{
    .modal-inner-widget{
        overflow:auto;
        padding-right:16px;
    }
    // .ivu-modal-footer{
    //     padding:0px;
    //     border:none;
    // }
    .ivu-modal-body{
        padding-right:0px;
    }
    .ivu-modal-footer{
        .ivu-form-item{
            margin-bottom:0px;
        }
    }
}
</style>


