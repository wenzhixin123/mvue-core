<template>
    <div>
        <template v-if="viewMode">
                <div class="form-item-view" v-text="getOptionsExData(valueObj)||emptyText"></div>
        </template>
        <template v-else>
            <Select v-model="valueObj" :disabled="disabled" :placeholder="formItem.componentParams.selectText" @on-change="updateValue">
                <Option v-for="item in formItem.componentParams.options" :key="item.id" :value="item.id">{{ item.text }}</Option>
            </Select>
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
            valueObj:null
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(this.value,this.valueObj)){
                this.valueToString();
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
        this.valueToString();
        if((!this.valueObj)&&this.valueObj!==0){
            this.initDefault();
        }
    },
    methods: {
        valueToString(){
            this.valueObj=this.value;
        },
        initDefault:function(){
            var _this=this;
            _.each(this.formItem.componentParams.options,function(option){
                if(option.checked){
                    _this.valueObj=option.id;
                    _this.$emit('input',_this.valueObj);
                    return false;
                }
            });
        },
        updateValue: function (value) {
            this.$emit('input',value);
        }
    }
}
</script>

