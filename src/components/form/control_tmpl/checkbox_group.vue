<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label :class="{'ivu-form-item-label':formItem.componentParams.required}" v-text="formItem.componentParams.title"></label>
            <div class="checkbox" v-for="item in formItem.componentParams.options" :key="item.id">
                <label>
                    <input @change="updateValue()" v-model="valueObj" type="checkbox" :disabled="disabled" :name="formItem.dataField" :checked="item.checked" :value="item.id">
                    {{item.text}}
                </label>
            </div>
            <div class="checkbox" v-if="formItem.componentParams.otherOptions.addOthers" :class="{'ivu-form-item-required':formItem.componentParams.otherOptions.required}">
                <label style="width:70px;">
                    <input type="checkbox" :disabled="disabled" :name="formItem.dataField" :value="formItem.componentParams.otherOptions.id">
                    {{formItem.componentParams.otherOptions.text}}
                    <span :class="{'ivu-form-item-label':formItem.componentParams.otherOptions.required}"></span>
                </label>
                <input @change="emitOthersValue($event.target.value)" style="width:70%;left:70px;position:absolute;" :disabled="disabled" type="text" class="form-control form-control-inline">
            </div>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <div class="checkbox" v-for="item in formItem.componentParams.options" :key="item.id">
                        <label>
                            <input @change="updateValue()" v-model="valueObj" type="checkbox" :disabled="disabled" :name="formItem.dataField" :checked="item.checked" :value="item.id">
                            {{item.text}}
                        </label>
                    </div>
                    <div class="checkbox" v-if="formItem.componentParams.otherOptions.addOthers" :class="{'ivu-form-item-required':formItem.componentParams.otherOptions.required}">
                        <label style="width:70px;">
                            <input type="checkbox" :disabled="disabled" :name="formItem.dataField" :value="formItem.componentParams.otherOptions.id">
                            {{formItem.componentParams.otherOptions.text}}
                            <span :class="{'ivu-form-item-label':formItem.componentParams.otherOptions.required}"></span>
                        </label>
                        <input @change="emitOthersValue($event.target.value)" style="width:70%;left:70px;position:absolute;" :disabled="disabled" type="text" class="form-control form-control-inline">
                    </div>
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
        "value":{type:Array,default:function(){
            return [];
        }}
    },
    data: function(){
        return {
            valueObj:null
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(newV,oldV)){
                this.valueObj=newV;
            }
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
        this.valueObj=this.value;
        if((!this.valueObj)||this.valueObj.length===0){
            this.initDefault();
        }
    },
    methods:{
        initDefault:function(){
            let _defaultSelected=[];
            if(this.formItem.componentParams.options){
                _.each(this.formItem.componentParams.options,function(option){
                    if(option.checked){
                        _defaultSelected.push(option.id);
                    }
                });
            }
            //如果当前选中的值和默认值不一样才变更
            if(!_.isEqual(this.valueObj,_defaultSelected)){
                this.valueObj=_.cloneDeep(_defaultSelected);
                this.$emit('input',_defaultSelected);
                this.emitExData();
            }
        },
        updateValue: function () {
            var emitValue=_.cloneDeep(this.valueObj);
            this.$emit('input',emitValue);
            this.emitExData();
        },
        emitOthersValue:function(othersValue){
            this.emitExData(othersValue);
        },
        emitExData:function(othersValue){
            var _this=this;
            var exData={};
            var optionsMap=_.keyBy(this.formItem.componentParams.options,"id");
            var othersId=this.formItem.componentParams.otherOptions.id;
            _.each(this.valueObj,function(selectedId){
                if(othersId!==selectedId){
                    exData[selectedId]=_this.buildExData(optionsMap[selectedId].text);
                }
            });
            if(othersValue){
                exData[othersId]=_this.buildExData(othersValue);
            }
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


