<template>
    <div>
        <template v-if="viewMode">
                <div class="form-item-view" v-text="getOptionsExData(valueObj)||emptyText" :title="getOptionsExData(valueObj)||emptyText"></div>
        </template>
        <template v-else>
            <Select transfer v-model="valueObj" :disabled="disabled" :placeholder="formItem.componentParams.placeholder||formItem.componentParams.selectText" @on-change="onChange">
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
    mounted:function() {
        this.valueToString();
        this.initDefault();
    },
    methods: {
        valueToString(){
            this.valueObj=this.value;
        },
        initDefault:function(){
            var _this=this;
            if((!this.valueObj)&&this.valueObj!==0) {
                _.each(this.formItem.componentParams.options, function (option) {
                    if (option.checked) {
                        _this.valueObj = option.id;
                        return false;
                    }
                });
            }
            this.onChange(this.valueObj);
        },
        onChange: function (value) {
            this.$emit('input',value);
        }
    }
}
</script>

