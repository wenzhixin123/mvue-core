<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="valueObj||emptyText"></div>
        </template>
        <template v-else>
            <DatePicker transfer
                    v-model="valueObj"
                    @on-change="handleChange"
                     :readonly="disabled" :disabled="disabled" :type="dateType"
                    :placeholder="formItem.componentParams.placeholder"></DatePicker>
        </template>
    </div>
</template>
<script>
var dayjs = require("dayjs");
import controlBase from '../js/control_base';
import dateType from '../js/date_type';
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
        dateType:function(){
            let datePrecision=this.formItem.componentParams.datePrecision;
            if(this.controlTypeService.datePrecision.year===datePrecision){
                return "year";
            }else if(this.controlTypeService.datePrecision.month===datePrecision){
                return "month";
            }else{
                return "date";
            }
        },
        dateFormat:function(){
            let datePrecision=this.formItem.componentParams.datePrecision;
            if(this.controlTypeService.datePrecision.year===datePrecision){
                return "YYYY";
            }else if(this.controlTypeService.datePrecision.month===datePrecision){
                return "YYYY-MM";
            }else{
                return "YYYY-MM-DD";
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
                let dv=dayjs(data).format(_this.dateFormat);
                _this.handleChange(dv);
            });
        },
        getValidPart:function(){//将传进来的值value转成特定的格式
            let datePrecision=this.formItem.componentParams.datePrecision;
            var _valueValidPart=dateType.formatDate(this.value,datePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的日期格式
            if(!newDate){
                this.$emit("input",null);
                return;
            }
            let datePrecision=this.formItem.componentParams.datePrecision;
            let _ds=newDate;
            if(this.dateFormat=="YYYY"){
                _ds=`${_ds}-01-01`;
            }else if(this.dateFormat=="YYYY-MM"){
                _ds=`${_ds}-01`;
            }
            let _d=dayjs(_ds);
            this.$emit("input",_d.format('YYYY-MM-DD'));
        }
    }
}
</script>


