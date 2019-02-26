<template>
    <div >
        <template v-if="viewMode">
                <div v-html="convertedValue()||emptyText" class="upload-form-item-view"></div>
        </template>
        <template v-else>
            <Input ref="focusInput" v-model="valueObj" @on-change="updateValue"  :disabled="disabled" type="textarea"  :rows="formItem.componentParams.rows||3"  :autosize="formItem.componentParams.autosize||{minRows: 3, maxRows: 10 }"
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
            if(!this.value){
                return '';
            }
            let _v=this.value.replace(/\r|\n/g,"<br>");
            _v=_v.replace(/\s/g,"&nbsp;");
            return _v;
        }
    }
}
</script>


