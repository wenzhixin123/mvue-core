<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <DatePicker
            v-model="valueObj" 
            @on-change="handleChange"
             style="width:100%;" :disabled="disabled" type="datetime" :format="dateTimeFormat" :placeholder="formItem.componentParams.placeholder"></DatePicker>
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
                    style="width:100%;" :disabled="disabled" type="datetime" :format="dateTimeFormat" :placeholder="formItem.componentParams.placeholder"></DatePicker>
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
        dateTimeFormat:function(){
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                return "yyyy-MM-dd HH:mm";
            }else{
                return "yyyy-MM-dd HH:mm:ss";//moment YYYY-MM-DD HH:mm:ss
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
            //moment format YYYY-MM-DD HH:mm:ss
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _valueValidPart=dateType.formatDateTime(this.value,timePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的日期时间格式
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _d=null;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                _d=moment(newDate,'YYYY-MM-DD HH:mm');
            }else{
                _d=moment(newDate,'YYYY-MM-DD HH:mm:ss');
            }
            this.$emit("input",_d.format('YYYY-MM-DD HH:mm:ss'));
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


