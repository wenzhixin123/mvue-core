<template>
    <div>
        <Input ref="focusInput" v-model="valueObj.value" 
            @input="updateValue" 
            :disabled="disabled" type="text"  
            :placeholder="rangeHelp">
            <Select @on-change="updateValue" v-model="valueObj.op" slot="prepend" style="width:60px;" :title="rangeHelp">
              <Option v-for="(text,value) in prependOptions" :value="value" :key="value">{{text}}</Option>
            </Select>
        </Input>
        <span v-if="error" class="error-style">{{error}}</span>
    </div>
</template>
<script>
import controlBase from '../../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:[Object,Number,String]
        }
    },
    data: function(){
      let {value,op}=this.convertedValue();
      return {
          valueObj:{
            op:op,
            value:value
          },
          prependOptions:{
            lt:'小于',
            gt:'大于',
            eq:'等于',
            range:'范围',
          },
          rangeHelp:'[范围]填写格式，空格分隔最小、最大值',
          error:false
      };
    },
    watch:{
        "value":function (newV,oldV) {
          if(!_.isEqual(newV,oldV)){
            let {value,op}=this.convertedValue();
            this.valueObj.op=op;
            this.valueObj.value=value;
          }
        }
    },
    mounted:function(){
        
    },
    methods: {
      isValid(){
        let _v=this.valueObj;
        if(!_v){
          this.error=false;
          return true;
        }
        let _value=_v.value;
        if(_.isNil(_value)){
          this.error=false;
          return true;
        }
        if(_v.op==='range'){
          let valueArray=_.split(_value,/[\s|,]/);
            if(valueArray){
              let geValue=_.toNumber(valueArray[0]);
              if(_.isNaN(geValue)){
                this.error=this.rangeHelp;
                return false;
              }
              if(valueArray.length>1){
                let leValue=_.toNumber(valueArray[1]);
                if(_.isNaN(leValue)){
                  this.error=this.rangeHelp;
                  return false;
                }
              }
            }
        }else{
          let cValue=_.toNumber(_value);
          if(_.isNaN(cValue)){
            this.error='请填写合法的数值';
            return false;
          }
        }
        this.error=false;
        return true;
      },
      convertedValue(){
        let _value={
          op:'',
          value:''
        };
        if(_.isPlainObject(this.value)){
          _value.op=this.value.op;
          _value.value=this.value.value;
        }else{
          _value.op='eq';
          let t=this.value;
          if(_.isNumber(this.value)){
            t=this.value.toString();
          }
          _value.value=t;
        }
        return _value;
      },
      updateValue: function (value) {
        this.isValid();
        this.$emit('input',this.valueObj);
      }
    }
}
</script>


