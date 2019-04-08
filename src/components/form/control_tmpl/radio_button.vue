<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="getOptionsExData(valueObj)||emptyText"></div>
        </template>
        <template v-else>
            <RadioGroup v-model="valueObj" @on-change="onChange" >
                <Radio v-for="item in formItem.componentParams.options" :key="item.id" :label="item.id"  :disabled="disabled">
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
        this.initDefault();
    },
    methods:{
        initDefault:function(){
            let _this=this;
            if(_.isNull(this.valueObj)){
                _.each(this.formItem.componentParams.options,function(option){
                    if(option.checked){
                        _this.valueObj=option.id;
                        return false;
                    }
                });
            }else{
                _this.onChange(this.valueObj);
            }
        },
        onChange: function (val) {
            if(val==null){
                return;
            }
            this.$emit('input',val);
        }
    }
}
</script>


