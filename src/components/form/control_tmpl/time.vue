<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(valueObj)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="valueObj"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <TimePicker
            v-model="valueObj" 
            @on-change="handleChange" 
            style="width:100%;" :readonly="disabled" :disabled="disabled" :format="timeFormat" :placeholder="formItem.componentParams.placeholder"></TimePicker>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <TimePicker
                    v-model="valueObj" 
                    @on-change="handleChange"
                     style="width:100%;" :readonly="disabled" :disabled="disabled" :format="timeFormat" :placeholder="formItem.componentParams.placeholder"></TimePicker>
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
        </template>
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
        timeFormat:function(){
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                return "HH:mm";
            }else{
                return "HH:mm:ss";
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
                let dv=moment(data).format(_this.timeFormat);
                _this.handleChange(dv);
            });
        },
        getValidPart:function(){//将传进来的值value转成特定的格式
            //moment format YYYY-MM-DD HH:mm:ss
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _valueValidPart=dateType.formatTime(this.value,timePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的时间格式
            if(!newDate){
                this.$emit("input",null);
                return;
            }
            let _d=moment(newDate,this.timeFormat);
            this.$emit("input",_d.format('HH:mm:ss'));
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


