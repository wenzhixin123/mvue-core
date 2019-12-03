<template>
    <div>
        <template v-if="viewMode">
                <div class="form-item-view" v-html="formatValue()" :title="value||emptyText"></div>
        </template>
        <template v-else>
            <i-input ref="focusInput" v-model="valueObj" 
                @input="updateValue" 
                :prefix="formItem.componentParams.prefix" 
                :suffix="formItem.componentParams.suffix" 
                :disabled="disabled" type="text"  
                :placeholder="formItem.componentParams.placeholder">
                <Select v-if="formItem.componentParams.prepend" @on-change="updateValue" v-model="prependVal" slot="prepend" :style="{width:formItem.componentParams.prependWidth||'80px'}">
                    <Option v-for="opt in prependOptions(formItem.componentParams.prepend)" :value="opt" :key="opt">{{opt}}</Option>
                </Select>
                <Select v-if="formItem.componentParams.append" @on-change="updateValue" v-model="appendVal" slot="append" :style="{width:formItem.componentParams.appendWidth||'80px'}">
                    <Option v-for="opt in appendOptions(formItem.componentParams.append)" :value="opt" :key="opt">{{opt}}</Option>
                </Select>
            </i-input>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import textType from '../js/text_type';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:String
        }
    },
    data: function(){
        let {valueObj,prependVal,appendVal}=this.convertedValue();
        return {
            valueObj:valueObj,
            prependVal:prependVal,
            appendVal:appendVal
        };
    },
    watch:{
      "value":function (newV,oldV) {
          if(!_.isEqual(newV,oldV)){
            let {valueObj,prependVal,appendVal}=this.convertedValue();
            this.valueObj=valueObj;
            this.prependVal=prependVal;
            this.appendVal=appendVal;
          }
      }
    },
    mounted:function(){
        this.updateValue();
    },
    methods: {
        convertedValue(){
            let res= {
                valueObj:this.value,
                prependVal:'',
                appendVal:''
            };
            if(!this.value){
                return res;
            }
            if(this.formItem.componentParams.prepend){
                let pOptions=this.prependOptions(this.formItem.componentParams.prepend);
                _.each(pOptions,opt=>{
                    if(_.startsWith(this.value,opt)){
                        res.prependVal=opt;
                        res.valueObj=this.value.substring(opt.length);
                        return false;
                    }
                });
            }
            if(this.formItem.componentParams.append){
                let aOptions=this.appendOptions(this.formItem.componentParams.append);
                _.each(aOptions,opt=>{
                    if(_.endsWith(this.value,opt)){
                        res.appendVal=opt;
                        res.valueObj=res.valueObj.substring(0,res.valueObj.length-opt.length);
                        return false;
                    }
                })
            }
            return res;
        },
        updateValue: function () {
            let res=this.valueObj;
            if(this.valueObj){
                res=`${this.prependVal}${res}${this.appendVal}`;
            }
            this.$emit('input',res);
        },
        prependOptions(val){
            let valMap={
                url:['http://','https://']
            }
            if(_.isString(val)){
                return valMap[val]||[];
            }else if(_.isArray(val)){
                return val;
            }
            return [];
        },
        appendOptions(val){
            if(_.isArray(val)){
                return val;
            }
            return [];
        },
        formatValue(){
            //如果指定格式，格式化输出
            let formatter=this.formItem.componentParams.formatter;
            if(formatter){
                let context={'value': this.value,model:this.model};
                let formattedValue=textType.stringFormat(context,formatter);
                return formattedValue;
            }
            let _value=this.value||this.emptyText;
            return _value;
        }
    }
}
</script>


