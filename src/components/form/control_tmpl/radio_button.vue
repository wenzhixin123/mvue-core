<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="getOptionsExData(valueObj)||emptyText" :title="getOptionsExData(valueObj)||emptyText"></div>
        </template>
        <template v-else>
            <RadioGroup v-model="valueObj" @on-change="onChange" >
                <Radio v-for="item in formItem.componentParams.options" :key="item.id" :label="item.id"  :disabled="disabled">
                    {{item.text}}
                </Radio>
                <template v-if="formItem.componentParams.showOthers">
                    <Radio :key="othersTag" :label="othersTag" :disabled="disabled">
                        {{othersText}}
                        <Input v-model="othersValue" :disabled="disabled" :maxlength="maxOthersLength()"/>
                    </Radio>
                </template>
            </RadioGroup>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import optionsUtils from '../../../libs/metadata/options-utils';

export default {
    mixins: [controlBase],
    props: {
        "value":{type:[Number,String],default:null}
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
            let val= `${optionsUtils.othersTag}${this.othersValue}`;
            this.$emit('input',val);
        },
        convertedValue(){
            let _others=false;
            let _othersValue='',_value=this.value;
            //如果开启用户自行填写其他选项，并且是用户自填的值，转换成真实的值
            if(this.formItem.componentParams.showOthers&&_.startsWith(this.value,optionsUtils.othersTag)){
                let index=optionsUtils.othersTag.length;
                _value=optionsUtils.othersTag;
                _othersValue=this.value.substring(index);
                _others=true;
            }
            return {_others,_value,_othersValue};
        },
        initDefault:function(){
            let _this=this;
            if(_.isNull(this.valueObj)&&this.isCreate()){
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
            if(this.formItem.componentParams.showOthers&&val==optionsUtils.othersTag){
                this.emitOthersValue();
            }else{
                this.$emit('input',val);
            }
        }
    }
}
</script>


