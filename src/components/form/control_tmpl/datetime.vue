<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="valueObj||emptyText"></div>
        </template>
        <template v-else>
            <DatePicker transfer
            v-model="valueObj" 
            @on-change="handleChange"
            :readonly="disabled" :disabled="disabled" type="datetime" :format="dateTimeFormat" :placeholder="formItem.componentParams.placeholder"></DatePicker>
        </template>
    </div>
</template>
<script>
var dayjs = require("dayjs");
import controlBase from '../js/control_base';
import dateType from '../js/date_type';
import context from '../../../libs/context';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:String,default:null}
    },
    data: function(){
        return {
            valueObj:null
        };
    },
    computed:{
        dateTimeFormat:function(){
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                return "yyyy-MM-dd HH:mm";
            }else{
                return "yyyy-MM-dd HH:mm:ss";
            }
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _valueValidPart=this.getValidPart();
            if(_valueValidPart!==this.valueObj){
                this.valueObj=_valueValidPart;
                this.$emit("input",_valueValidPart);
            }
        }
    },
    mounted:function(){
        if(this.value){
            var _valueValidPart=this.getValidPart();
            this.valueObj=_valueValidPart;
            this.handleChange(_valueValidPart);
        }
    },
    methods:{
        initDefaultByType(){
            let _this=this;
            this.calcField().then((data)=>{
                if(!data){
                    return;
                }
                let dv=dayjs(data).format(context.getMvueToolkit().utils.getMomentFormat(_this.dateTimeFormat));
                _this.handleChange(dv);
            });
        },
        getValidPart:function(){//将传进来的值value转成特定的格式
            //dayjs format YYYY-MM-DD HH:mm:ss
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _valueValidPart=dateType.formatDateTime(this.value,timePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的日期时间格式
            if(!newDate){
                this.$emit("input",null);
                return;
            }
            let _d=dayjs(newDate);
            this.$emit("input",_d.format('YYYY-MM-DD HH:mm:ss'));
        }
    }
}
</script>


