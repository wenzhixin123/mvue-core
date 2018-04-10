<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label :class="{'ivu-form-item-label':formItem.componentParams.required}" v-text="formItem.componentParams.title"></label>
            <Cascader  @on-change="handleChange" :data="optionsData" v-model="valueObj"></Cascader>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <Cascader  @on-change="handleChange" :data="optionsData" v-model="valueObj"></Cascader>
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
            valueObj:[],
            optionsData:[]
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(newV,oldV)){
                this.valueObj=newV;
            }
        },
        "formItem.componentParams.cascadeOptions":{
            handler:function(newOptions,oldOptions){
                this.convertModel();
            },
            deep:true
        }
    },
    mounted:function(){
        var _this=this;
        if(this.value){
            this.valueObj=_.cloneDeep(this.value);
        }
        this.convertModel();
    },
    methods:{
        convertModel(){
            if(this.formItem.componentParams.cascadeOptions&&this.formItem.componentParams.cascadeOptions.options){
                _.each(this.formItem.componentParams.cascadeOptions.options,function(level1){
                    level1.value=level1.id;
                    level1.label=level1.text;
                    if(level1.children){
                        _.each(level1.children,function(level2){
                            level2.value=level2.id;
                            level2.label=level2.text;
                            if(level2.children){
                                _.each(level2.children,function(level3){
                                    level3.value=level3.id;
                                    level3.label=level3.text;
                                    if(level3.children){
                                        _.each(level3.children,function(level4){
                                            level4.value=level4.id;
                                            level4.label=level4.text;
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                this.optionsData=this.formItem.componentParams.cascadeOptions.options;
            }
        },
        handleChange(value,selectedData){
            var emitValue=_.cloneDeep(value);
            this.$emit('input',emitValue);
            this.emitExData(selectedData);
        },
        emitExData:function(selectedData){
            var exData={};
            _.each(selectedData,function(item){
                exData[item.value]=item.text;
            });
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