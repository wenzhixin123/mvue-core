<template>
    <div>
        <template v-if="viewMode">
            <RadioGroup v-model="valueObj">
                <Radio label="是" disabled></Radio>
                <Radio label="否" disabled></Radio>
            </RadioGroup>
        </template>
        <template v-else>
            <RadioGroup v-model="valueObj" @on-change="updateValue" :disabled="disabled">
                <Radio label="是" disabled></Radio>
                <Radio label="否" disabled></Radio>
            </RadioGroup>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:Boolean,default:false}
    },
    data: function(){
        return {
            valueObj:false
        };
    },
    watch:{
        "value":function(newV,oldV){
            this.valueObj=newV;
        }
    },
    mounted:function(){
        var _this=this;
        this.valueObj=this.value;
    },
    methods:{
        updateValue: function ($checkbox) {
            this.$emit('input',this.valueObj);
        }
    }
}
</script>
<style lang="scss" scoped>
    
</style>


