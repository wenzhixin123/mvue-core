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
                let clientHeight=document.documentElement.clientHeight-160;
                return clientHeight>0?clientHeight:400;
            }
        }
    },
    data(){
        return {
            popupWidgetModal:false
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


