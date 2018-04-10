import controlTypeService from './control_type_service';
import constants from './constants';
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        },
        mode:{
            type:String,
            default:controlTypeService.controlMode.normal
        },
        validator:{
            type:Object
        },
        paths:{
            type:Object,
            default:function(){
                return {};
            }
        },
        model:{//表单的模型数据
            type:Object
        }
    },
    data:function(){
        return {
            controlTypeService:controlTypeService
        };
    },
    mounted:function(){
        //用来将默认空值，填充到表单的formData中，否则无法验证
        if(!this.value&&this.value!==0&&this.value!==false){
            this.$emit('input',null);
        }else if(this.value&&this.value.length==0){
            this.$emit('input',[]);
        }
    },
    computed:{
        labelWidth:function(){
            let lwidth=this.formItem.componentParams.horizontalLayoutLabelWidth;
            return lwidth+"%";
        },
        controlWidth:function(){
            let lwidth=this.formItem.componentParams.horizontalLayoutLabelWidth;
            let rwidth=100-_.toInteger(lwidth);
            return rwidth+"%";
        },
        disabled:function(){
            return this.mode!==controlTypeService.controlMode.normal;
        }
    },
    methods:{
        buildExData(value){//构造组件需要保存的冗余数据
            var exData={};
            exData[constants.entityModelTitleKey]=value;
            return exData;
        },
        getExData(id){//编辑模式获取当前表单数据字段id的冗余数据
            if(!id){
                return null;
            }
            var _data=this.model&&this.model[constants.entityModelRedundantKey];
            _data=_data||{};
            _data= _data[this.formItem.dataField]||{};
            return _data[id]&&_data[id][constants.entityModelTitleKey];
        }
    }
}