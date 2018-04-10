<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label :class="{'ivu-form-item-label':formItem.componentParams.required}" v-text="formItem.componentParams.title"></label>
            <div class="checkbox">
                <label>
                    <input v-model="valueObj" @change="updateValue($event.target)" :disabled="disabled" :true-value="true" :false-value="false" type="checkbox">
                </label>
            </div>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <div class="checkbox">
                        <label>
                            <input v-model="valueObj" @change="updateValue($event.target)" :disabled="disabled" :true-value="true" :false-value="false" type="checkbox">
                        </label>
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
        "value":{type:Boolean,default:false}
    },
    data: function(){
        return {
            valueObj:false
        };
    },
    watch:{
        "value":function(newV,oldV){
            this.valueObj=newV;
        }
    },
    mounted:function(){
        var _this=this;
        this.valueObj=this.value;
    },
    methods:{
        updateValue: function ($checkbox) {
            this.$emit('input',this.valueObj);
        }
    }
}
</script>
<style lang="scss" scoped>
    
</style>


