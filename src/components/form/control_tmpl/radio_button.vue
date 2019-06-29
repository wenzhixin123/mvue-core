<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(valueObj)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="getExData(valueObj)"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label :class="{'ivu-form-item-label':formItem.componentParams.required}" v-text="formItem.componentParams.title"></label>
            <div class="radio" v-for="item in formItem.componentParams.options" :key="item.id">
                <label>
                    <input @change="updateValue($event.target,item.text)" v-model="valueObj" type="radio" :disabled="disabled" :name="formItem.dataField" :value="item.id">
                    {{item.text}}
                </label>
            </div>
            <div class="radio" v-if="formItem.componentParams.otherOptions.addOthers" :class="{'ivu-form-item-required':formItem.componentParams.otherOptions.required}">
                <label style="width:70px;">
                    <input @change="updateValue($event.target)" v-model="valueObj" type="radio" :disabled="disabled" :name="formItem.dataField" :value="formItem.componentParams.otherOptions.id">
                    {{formItem.componentParams.otherOptions.text}}
                    <span :class="{'ivu-form-item-label':formItem.componentParams.otherOptions.required}"></span>
                </label>
                <input @change="emitOthersValue($event.target.value)" style="width:70%;left:70px;position:absolute;" :disabled="disabled" v-model="inputText" type="text" class="form-control form-control-inline">
            </div>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10 parentBox" :style="{width:controlWidth}">
                    <div class="radio" style="margin-right: 8px;" v-for="item in formItem.componentParams.options" :key="item.id">
                            <label>
                                <input @change="updateValue($event.target,item.text)" v-model="valueObj" type="radio" :disabled="disabled" :name="formItem.dataField" :value="item.id">
                                {{item.text}}
                            </label>
                        </div>
                    <div class="radio" style="margin-right: 8px;" v-if="formItem.componentParams.otherOptions.addOthers" :class="{'ivu-form-item-required':formItem.componentParams.otherOptions.required}">
                        <label style="width:70px;">
                            <input @change="updateValue($event.target)" v-model="valueObj" type="radio" :disabled="disabled" :name="formItem.dataField" :value="formItem.componentParams.otherOptions.id">
                            {{formItem.componentParams.otherOptions.text}}
                            <span :class="{'ivu-form-item-label':formItem.componentParams.otherOptions.required}"></span>
                        </label>
                        <!--<input @change="emitOthersValue($event.target.value)" style="width:92%;right:0px;top:0px;position:absolute;" :disabled="disabled" v-model="inputText" type="text" class="form-control form-control-inline new-style">-->
                    </div>
                    <div class="otherInput">
                        <input v-if="formItem.componentParams.otherOptions.addOthers" :class="{'ivu-form-item-required':formItem.componentParams.otherOptions.required}" @change="emitOthersValue($event.target.value)" :disabled="disabled" v-model="inputText" type="text" class="form-control form-control-inline ">
                        <span class="colorRed othertips" v-show="validTag">必填项.</span>
                    </div>

                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
        </template>
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
            isNumber:false,
            inputText:"",
            validTag:false,
            isSelectOthers:""
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
        },
        "inputText":function (newV,oldV) {
            if(newV !==undefined){
                if(newV.trim() == "" && this.isSelectOthers){
                    this.validTag = true
                }else {
                    this.validTag = false
                }
            }
        }
    },
    mounted:function(){
        var _this=this;
        this.valueToString();
        if(!this.valueObj){
            this.initDefault();
        }
    },
    methods:{
        valueToString(){
            if(_.isNumber(this.value)){
                this.isNumber=true;
            }
            this.valueObj=_.toString(this.value);
            if(this.valueObj=="_others"){
                //其他
                this.inputText=this.getExData(this.valueObj);
                this.isNumber = false;

                this.isSelectOthers = true;
            }else{
                this.inputText = "";

                this.isSelectOthers = false;
            }
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
        updateValue: function ($checkbox,text) {
            var _value=$checkbox.value;
            if(this.isNumber){
                _value=_.toNumber(_value);
            }
            this.$emit('input',_value);
            if(text){
                this.emitExData(_value,text);
            }

            if(_value == "_others"){
                this.validTag = true;
            }else {
                this.validTag = false;
            }

        },
        emitOthersValue:function(othersValue){
            var othersId=this.formItem.componentParams.otherOptions.id;
            this.emitExData(othersId,othersValue);
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
    .parentBox{
        display: flex;
        flex-shrink: 0;
    }
    .otherInput{
        flex: 1;
    }
    .othertips{
        position: absolute;
        top: 34px;
    }

</style>


