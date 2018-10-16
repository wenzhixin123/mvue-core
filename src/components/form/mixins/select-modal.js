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
            default:850
        },
        modalHeight:{
            type:Number,
            default:400
        }
    },
    data(){
        return {
            popupWidgetModal:false
        };
    },
    methods:{
        toggleModal(){
            this.popupWidgetModal=!this.popupWidgetModal;
        },
        close(){//关闭对话框
            this.popupWidgetModal=false;
        }
    }
}


