<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(value)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="value"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group has-feedback" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <input :value="value" @input="updateValue($event.target.value)" :disabled="disabled" type="text" class="form-control" :placeholder="formItem.componentParams.placeholder">
            <span class="form-control-feedback" v-text="formItem.componentParams.unit"></span>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group has-feedback" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <input :value="value" @input="updateValue($event.target.value)" :disabled="disabled" type="text" class="form-control" :placeholder="formItem.componentParams.placeholder">
                    <span class="form-control-feedback" aria-hidden="true" v-text="formItem.componentParams.unit"></span>
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
        "value":{
            type:[Number,String]
        }
    },
    mounted:function(){
        if(this.isFixedValue()){
            let _this=this;
            this.initFixedField(function(data){
                _this.$emit('input',data);
            });
        }
    },
    methods: {
        updateValue: function (value) {
            var _num=_.toNumber(value);
            if(_.isNaN(_num)){
                _num=value;
            }
            if(value===""){
                _num=null;
            }
            this.$emit('input',_num);
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


