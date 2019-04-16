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
            default(){
                if(!document.documentElement){
                    return 400;
                }
                let clientHeight=document.documentElement.clientHeight-190;
                return clientHeight>0?clientHeight:400;
            }
        }
    },
    data(){
        return {
            popupWidgetModal:false,
            isPopup:true//标记弹出的选择框
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


