<template>
    <div>
        <template v-if="viewMode">
            <RadioGroup v-model="valueObj">
                <Radio :label="1" disabled>是</Radio>
                <Radio :label="0" disabled>否</Radio>
            </RadioGroup>
        </template>
        <template v-else>
            <RadioGroup v-model="valueObj" @on-change="updateValue">
                <Radio :label="1" :disabled="disabled">是</Radio>
                <Radio :label="0" :disabled="disabled">否</Radio>
            </RadioGroup>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:[Boolean,Number],default:false}
    },
    data: function(){
        return {
            valueObj:0
        };
    },
    watch:{
        "value":function(newV,oldV){
           this.valueObj=this.convert(newV);
        }
    },
    mounted:function(){
        var _this=this;
        this.valueObj=this.convert(this.value);
        this.updateValue();
    },
    methods:{
        convert:function (newV) {
            var reVal=0;
            if(_.isNumber(this.value)){
                if(newV==0){
                    reVal=0;
                }else{
                    reVal=1;
                }
            }else{
                if(newV){
                    reVal=1;
                }else{
                    reVal=0;
                }
            }
            return reVal;
        },
        updateValue: function () {
            if(_.isNumber(this.value)){
                this.$emit('input',this.valueObj);
            }else{
                this.$emit('input',this.valueObj==1?true:false);
            }
        }
    }
}
</script>
<style lang="scss" scoped>
    
</style>


