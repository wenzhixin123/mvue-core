<template>
    <div>
        <template v-if="viewMode">
                <div v-text="getExData(valueObj)"></div>
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


