<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="viewModeValue()||emptyText" :title="viewModeValue()||emptyText"></div>
        </template>
        <template v-else>
            <CheckboxGroup v-model="valueObj" @on-change="updateValue">
                <Checkbox  v-for="item in formItem.componentParams.options" :key="item.id" :label="item.id" :disabled="disabled">{{item.text}}</Checkbox>
                <template v-if="formItem.componentParams.showOthers">
                    <Checkbox :key="othersTag" :label="othersTag" :disabled="disabled">
                        {{othersText}}
                        <Input v-model="othersValue" :disabled="disabled" :maxlength="maxOthersLength()"/>
                    </Checkbox>
                </template>
            </CheckboxGroup>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import optionsUtils from '../../../libs/metadata/options-utils';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    data: function(){
        let {_others,_value,_othersValue}=this.convertedValue();
        return {
            valueObj:_value,
            othersValue:_othersValue,//其他选项的model
            othersTag:optionsUtils.othersTag,//其他选项的标记名
            othersText:this.formItem.componentParams.othersText||optionsUtils.othersText//其他选项的默认说明
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(newV,oldV)){
                let {_others,_value,_othersValue}=this.convertedValue();
                this.valueObj=_value;
                this.othersValue=_othersValue||this.othersValue;
            }
        },
        "formItem.componentParams.options":{
            handler:function(newOptions,oldOptions){
                this.initDefault();
            },
            deep:true
        },
        "othersValue":function(newV,oldV){
            this.emitOthersValue();
        }
    },
    mounted:function(){
        this.initDefault();
    },
    methods:{
        maxOthersLength(){
            if(this.formItem.componentParams.othersInputMax){
                return this.formItem.componentParams.othersInputMax;
            }
            if(this.formItem.componentParams.limitLength&&this.formItem.componentParams.limitLength.max){
                return this.formItem.componentParams.limitLength.max-this.othersTag.length;
            }
            return undefined;
        },
        emitOthersValue(){
            let vals=[];
            _.forEach(this.valueObj,_v=>{
                if(_v==optionsUtils.othersTag){
                    let val= `${optionsUtils.othersTag}${this.othersValue}`;
                    vals.push(val);
                }else{
                    vals.push(_v);
                }
            })
            this.$emit('input',vals);
        },
        convertedValue(){
            let _others=false;
            let _othersValue='',_value=[];
            if(!_.isEmpty(this.value)){
                _.forEach(this.value,_v=>{
                    //如果开启用户自行填写其他选项，并且是用户自填的值，转换成真实的值
                    if(this.formItem.componentParams.showOthers&&_.startsWith(_v,optionsUtils.othersTag)){
                        let index=optionsUtils.othersTag.length;
                        _othersValue=_v.substring(index);
                        _value.push(optionsUtils.othersTag);
                        _others=true;
                    }else{
                       _value.push(_v); 
                    }
                });
            }
            return {_others,_value,_othersValue};
        },
        initDefault:function(){
            if(!(this.isCreate()&&_.isEmpty(this.valueObj))){
                return ;
            }
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
            if(this.formItem.componentParams.showOthers&&_.includes(this.valueObj,optionsUtils.othersTag)){
                this.emitOthersValue();
            }else{
                let emitValue=_.cloneDeep(this.valueObj);
                this.$emit('input',emitValue);
            }
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


