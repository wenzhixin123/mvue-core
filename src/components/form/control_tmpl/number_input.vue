<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div v-text="value"></div>
        </template>
        <template v-else>
            <InputNumber   v-model="valueObj" @on-change="updateValue"  :disabled="disabled"
                           :placeholder="formItem.componentParams.placeholder"></InputNumber >
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:[Number,String]
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
        updateValue: function (value) {
            var _num=_.toNumber(this.valueObj);
            if(_.isNaN(_num)){
                _num=value;
            }
            if(value===""){
                _num=null;
            }
            this.$emit('input',_num);
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


