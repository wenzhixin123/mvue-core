<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(value)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <!--
                <textarea v-text="value" rows="3" readonly style="border:none;resize:none;width:100%;"></textarea>
                -->
                <div v-html="convertedValue()" class="view-textarea"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <textarea :value="value" @input="updateValue($event.target.value)" :disabled="disabled" rows="5" class="form-control" :placeholder="formItem.componentParams.placeholder"></textarea>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <textarea :value="value" @input="updateValue($event.target.value)" :disabled="disabled" rows="5" class="form-control" :placeholder="formItem.componentParams.placeholder"></textarea>
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
            type:String
        }
    },
    methods: {
        updateValue: function (value) {
            this.$emit('input',value);
        },
        convertedValue(){
            let _v=_.replace(this.value,/\r|\n/g,"<br>");
            _v=_.replace(_v,/\s/g,"&nbsp;");
            return _v;
        }
    }
}
</script>
<style lang="scss" scoped>
.view-textarea{
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}
</style>


