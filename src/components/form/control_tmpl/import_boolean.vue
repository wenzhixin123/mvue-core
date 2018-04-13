<template>
    <div style="display:inline;">
        <label style="font-weight:normal;">
            <input v-model="valueObj" @change="updateValue($event.target)" :disabled="disabled" :true-value="true" :false-value="false" type="checkbox">
            {{formItem.componentParams.title}}
        </label>
        <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
        <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
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


