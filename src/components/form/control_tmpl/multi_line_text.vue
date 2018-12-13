<template>
    <div >
        <template v-if="viewMode">
                <div v-html="convertedValue()" class="view-textarea"></div>
        </template>
        <template v-else>
            <Input v-model="valueObj" @on-change="updateValue"  :disabled="disabled" type="textarea"  :rows="rows"  :autosize="autosize"
                   :placeholder="formItem.componentParams.placeholder"></Input>
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
        },
        "rows":{
            type:Number,
            default:3
        },
        "autosize":{
            type:[Boolean ,Object],
            default:function () {
                return {minRows: this.rows, maxRows: 10 };
            }
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
    methods: {
        updateValue: function ($event) {
            this.$emit('input',this.valueObj);
        },
        convertedValue(){
            let _v=_.replace(this.value,/\r|\n/g,"<br>");
            _v=_.replace(_v,/\s/g,"&nbsp;");
            return _v;
        }
    }
}
</script>


