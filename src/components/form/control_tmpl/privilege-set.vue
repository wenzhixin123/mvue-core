<template>
    <div>
        <template v-if="viewMode">
            <div v-text="viewModeValue()"></div>
        </template>
        <template v-else>
            <CheckboxGroup v-model="valueObj" @on-change="updateValue">
                <Checkbox  v-for="item in formItem.componentParams.options" :key="item.id.toString()" :label="item.id.toString()" :disabled="disabled">{{item.text}}</Checkbox>
            </CheckboxGroup>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import optionsType from '../js/options_type';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:Number,default:0}
    },
    data: function(){
        return {
            valueObj:[]
        };
    },
    watch:{
        "value":function(newV,oldV){
            if(!_.isEqual(newV,oldV)){
                this.valueObj=optionsType.toDiscreteValue(newV);
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
        this.valueObj=optionsType.toDiscreteValue(this.value);
        if((!this.valueObj)||this.valueObj.length===0){
            this.initDefault();
        }
    },
    methods:{
        toSumValue(){
            if(this.valueObj.length>0){
                let len=this.valueObj.length;
                let sum=0;
                for(let i=0;i<len;++i){
                    sum+=_.toSafeInteger(this.valueObj[i]);
                }
                return sum;
            }else{
                return 0;
            }
        },
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
                this.$emit('input',this.toSumValue());
                this.emitExData();
            }
        },
        updateValue: function (vals) {
            this.$emit('input',this.toSumValue());
            this.emitExData();
        },
        emitExData:function(othersValue){
            var _this=this;
            var exData={};
            var optionsMap=_.keyBy(this.formItem.componentParams.options,function (option) {
                return option.id;
            });
            _.each(this.valueObj,function(selectedId){
                exData[selectedId]=_this.buildExData(optionsMap[selectedId].text);
            });
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        },
        viewModeValue(){
            if(this.valueObj&&this.valueObj){
                let texts=[];
                let _this=this;
                _.each(this.valueObj,function(id){
                    let exValue=_this.getExData(id);
                    texts.push(exValue);
                });
                return texts.join(",");
            }
            return "";
        }
    }
}
</script>


