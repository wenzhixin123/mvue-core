<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="viewModeValue()||emptyText" :title="viewModeValue()||emptyText"></div>
        </template>
        <template v-else>
            <CheckboxGroup v-model="valueObj" @on-change="updateValue">
                <Checkbox  v-for="item in formItem.componentParams.options" :key="item.id" :label="item.id" :disabled="disabled">{{item.text}}</Checkbox>
            </CheckboxGroup>
        </template>
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
            valueObj:[]
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(newV,oldV)){
                this.valueObj=newV;
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
        this.valueObj=this.value;
        if((!this.valueObj)||this.valueObj.length===0){
            this.initDefault();
        }
    },
    methods:{
        initDefault:function(){
            let _defaultSelected=[];
            if(this.formItem.componentParams.options){
                _.each(this.formItem.componentParams.options,function(option){
                    if(option.checked){
                        _defaultSelected.push(option.id);
                    }
                });
            }
            //如果当前选中的值和默认值不一样才变更
            if(!_.isEqual(this.valueObj,_defaultSelected)){
                this.valueObj=_.cloneDeep(_defaultSelected);
                this.$emit('input',_defaultSelected);
            }
        },
        updateValue: function (vals) {
            var emitValue=_.cloneDeep(this.valueObj);
            this.$emit('input',emitValue);
        },
        
        viewModeValue(){
            if(!_.isEmpty(this.valueObj)){
                let texts=this.getOptionsExData(this.valueObj);
                return texts.join(",");
            }
            return "";
        }
    }
}
</script>


