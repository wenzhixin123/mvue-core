<template>
    <div>
      <Input ref="focusInput" v-model="valueObj.value" 
          @input="updateValue" 
          :disabled="disabled" type="text"  
          :placeholder="formItem.componentParams.placeholder">
          <Select @on-change="updateValue" v-model="valueObj.op" slot="prepend" style="width:60px;" title="[范围]填写格式，空格分隔最小、最大值">
              <Option v-for="(text,value) in prependOptions" :value="value" :key="value">{{text}}</Option>
          </Select>
      </Input>
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
            le:'小于',
            ge:'大于',
            eq:'等于',
            range:'范围',
          }
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
          this.$emit('input',this.valueObj);
      }
    }
}
</script>


