<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(value)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="issuedObjcet.fullText"></div>
            </div>
        </template>
        <template v-else>
            <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
                <div class="issued_align">
                    <div class="col-md-3">
                        <input v-model="issuedObjcet.code" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">[</div>
                    <div class="col-md-3">
                        <input v-model="issuedObjcet.year" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">]</div>
                    <div class="col-md-3">
                        <input v-model="issuedObjcet.number" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">号</div>
                </div>
                <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
            </div>
            <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
                <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                    <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                    <div class="col-md-10" :style="{width:controlWidth}">
                        <div class="issued_align">
                            <div class="col-md-3">
                                <input v-model="issuedObjcet.code" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                            </div>
                            <div class="col-md-1 issued_align">[</div>
                            <div class="col-md-3">
                                <input v-model="issuedObjcet.year" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                            </div>
                            <div class="col-md-1 issued_align">]</div>
                            <div class="col-md-3">
                                <input v-model="issuedObjcet.number" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                            </div>
                            <div class="col-md-1 issued_align">号</div>
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
            "value":{
                type:Object,
                default:function(){
                    return {};
                }
            }
        },
        data(){
            return {
                issuedObjcet:{
                    fullText:"",
                    code:"",
                    year:"",
                    number:""
                }
            }
        },
        watch:{
            "value":function(newV,oldV){
                var _issuedObjcet=this.issuedObjcet
                if(newV){
                    Object.assign(_issuedObjcet,newV)
                }
            }
        },
        mounted:function(){
            if(!_.isEmpty(this.value)){
                this.issuedObjcet=_.cloneDeep(this.value);
            }else{
                this.$emit('input',"");
            }
        },
        methods: {
            updateValue: function () {
                let _issuedObjcet = this.issuedObjcet;
                if(_.some(_.values(_issuedObjcet))){
                    this.$emit('input',this.issuedObjcet);
                }else{
                    this.$emit('input',"");
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
.issued_align{  height: 33px; line-height: 33px; text-align: center }
</style>


