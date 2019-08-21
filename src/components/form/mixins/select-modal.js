import context from '../../../libs/context'
export default {
    props:{
        btnIcon:{
            type:String,
            default:'ios-search'
        },
        modalTitle:{
            type:String,
            default:'选择'
        },
        modalWidth:{
            type:Number,
            default:80
        },
        modalHeight:{
            type:Number,
            default:context.modalHeight()
        }
    },
    watch:{
        popupWidgetModal(){
            if(this.popupWidgetModal){
                this.innerModalHeight=this.modalHeight||context.modalHeight();
            }
        }
    },
    data(){
        return {
            popupWidgetModal:false,
            isPopup:true,//标记弹出的选择框
            innerModalHeight:this.modalHeight
        };
    },
    methods:{
        toggleModal(){
            if(this.disabled){
                return false;
            }
            this.popupWidgetModal=!this.popupWidgetModal;
        },
        close(){//关闭对话框
            this.popupWidgetModal=false;
        }
    }
}


