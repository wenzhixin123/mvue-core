<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <DatePicker 
            v-model="valueObj" 
            @on-change="handleChange"
            style="width:100%;" :disabled="disabled" :type="dateType" :placeholder="formItem.componentParams.placeholder"></DatePicker>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <DatePicker 
                    v-model="valueObj" 
                    @on-change="handleChange"
                    style="width:100%;" :disabled="disabled" :type="dateType" :placeholder="formItem.componentParams.placeholder"></DatePicker>
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
var moment = require('moment'); 
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
        var _valueValidPart=this.getValidPart();
        this.valueObj=_valueValidPart;
    },
    methods:{
        getValidPart:function(){//将传进来的值value转成特定的格式
            let datePrecision=this.formItem.componentParams.datePrecision;
            var _valueValidPart=dateType.formatDate(this.value,datePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的日期格式
            let datePrecision=this.formItem.componentParams.datePrecision;
            let _d=null;
            if(this.controlTypeService.datePrecision.year===datePrecision){
                _d=moment(newDate,'YYYY');
            }else if(this.controlTypeService.datePrecision.month===datePrecision){
                _d=moment(newDate,'YYYY-MM');
            }else{
                _d=moment(newDate,'YYYY-MM-DD');
            }
            this.$emit("input",_d.format('YYYY-MM-DD'));
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


