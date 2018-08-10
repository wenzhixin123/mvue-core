<template>
    <div>
        <template v-if="viewMode">
            <div v-text="getExData(valueObj)"></div>
        </template>
        <template v-else>
            <RadioGroup v-model="valueObj" @on-change="updateValue" >
                <Radio v-for="item in formItem.componentParams.options" :key="item.id" :label="item.id" :true-value="item.id" :disabled="disabled">
                    {{item.text}}
                </Radio>
            </RadioGroup>
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
            valueObj:this.value,
        };
    },
    watch:{
        "value":function(newV,oldV){
            this.valueObj=newV;
        },
        "formItem.componentParams.options":{
            handler:function(newOptions,oldOptions){
                this.initDefault();
            },
            deep:true
        }
    },
    mounted:function(){
        if(!this.valueObj){
            this.initDefault();
        }
    },
    methods:{
        initDefault:function(){
            var _this=this;
            _.each(this.formItem.componentParams.options,function(option){
                if(option.checked){
                    _this.valueObj=option.id;
                    _this.updateValue(option.id);
                    _this.$emit('input',_this.valueObj);
                    _this.emitExData(option.id,option.text);
                    return false;
                }
            });
        },
        updateValue: function (val) {
            if(val==null){
                return;
            }
            var selectedItem=null;
            _.each(this.formItem.componentParams.options,function(option){
               if(option.id==val){
                   selectedItem=option;
                   return false;
               }
            });
            this.$emit('input',val);
            if(selectedItem!=null){
                this.emitExData(selectedItem.id,selectedItem.text);
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


