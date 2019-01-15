<template>
    <div>
        <template v-if="viewMode">
                <div v-text="value"></div>
        </template>
        <template v-else>
            <Input ref="focusInput" v-model="valueObj" @input="updateValue"  :disabled="disabled" type="text"  :placeholder="formItem.componentParams.placeholder"></Input>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:String
        }
    },
    data: function(){
        return {
            valueObj:this.value
        };
    },
    watch:{
      "value":function (newV,oldV) {
          this.valueObj=newV;
      }
    },
    mounted:function(){
        if(this.isFixedValue()){
            let _this=this;
            this.initFixedField(function(data){
                _this.$emit('input',data);
            });
        }
    },
    methods: {
        updateValue: function ($event) {
            this.$emit('input',this.valueObj);
        }
    }
}
</script>


