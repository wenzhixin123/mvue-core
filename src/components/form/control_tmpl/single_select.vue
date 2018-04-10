<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label :class="{'ivu-form-item-label':formItem.componentParams.required}" v-text="formItem.componentParams.title"></label>
            <select v-model="valueObj" @input="updateValue($event.target.value)" :disabled="disabled" class="form-control" :name="formItem.dataField">
                <option value="" v-text="formItem.componentParams.selectText"></option>
                <option v-for="item in formItem.componentParams.options" 
                    :key="item.id" :value="item.id" v-text="item.text"></option>
            </select>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <select v-model="valueObj" @input="updateValue($event.target.value)" :disabled="disabled" class="form-control" :name="formItem.dataField">
                        <option value="" v-text="formItem.componentParams.selectText"></option>
                        <option v-for="item in formItem.componentParams.options" 
                            :key="item.id" :value="item.id" v-text="item.text"></option>
                    </select>
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:[Number,String],default:null}
    },
    data: function(){
        return {
            valueObj:null,
            isNumber:false
        };
    },
    watch:{
        "value":function(newV,oldV){
            this.valueToString();
        },
        "formItem.componentParams.options":{
            handler:function(newOptions,oldOptions){
                this.initDefault();
            },
            deep:true
        }
    },
    mounted:function(){
        var _this=this;
        this.valueToString();
        if(!this.valueObj){
            this.initDefault();
        }
    },
    methods: {
        valueToString(){
            if(_.isNumber(this.value)){
                this.isNumber=true;
            }
            this.valueObj=_.toString(this.value);
        },
        initDefault:function(){
            var _this=this;
            _.each(this.formItem.componentParams.options,function(option){
                if(option.checked){
                    _this.valueObj=option.id;
                    _this.$emit('input',_this.valueObj);
                    _this.emitExData(option.id,option.text);
                    return false;
                }
            });
        },
        updateValue: function (value) {
            if(this.isNumber){
                value=_.toNumber(value);
            }
            this.$emit('input',value);
            var optionsMap=_.keyBy(this.formItem.componentParams.options,"id");
            if(value&&optionsMap[value]){
                this.emitExData(value,optionsMap[value].text);
            }
        },
        emitExData:function(id,text){
            var exData={};
            exData[id]=this.buildExData(text);
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        }
    }
}
</script>
<style lang="scss" scoped>
    .form-control.form-control-inline{
        display: inline-block;
    }
</style>


