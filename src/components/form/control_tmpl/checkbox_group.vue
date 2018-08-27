<template>
    <div>
        <template v-if="viewMode">
            <div v-text="viewModeValue()"></div>
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
                this.emitExData();
            }
        },
        updateValue: function (vals) {
            var emitValue=_.cloneDeep(this.valueObj);
            this.$emit('input',emitValue);
            this.emitExData();
        },
        emitOthersValue:function(othersValue){
            this.emitExData(othersValue);
        },
        emitExData:function(othersValue){
            var _this=this;
            var exData={};
            var optionsMap=_.keyBy(this.formItem.componentParams.options,function (option) {
                return option.id;
            });
            var othersId=this.formItem.componentParams.otherOptions.id;
            _.each(this.valueObj,function(selectedId){
                if(othersId!==selectedId){
                    exData[selectedId]=_this.buildExData(optionsMap[selectedId].text);
                }
            });
            if(othersValue){
                exData[othersId]=_this.buildExData(othersValue);
            }
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


