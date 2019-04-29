<template>
    <div >
        <template v-if="viewMode">
                <div v-text="convertedValue()||emptyText" class="upload-form-item-view"></div>
        </template>
        <template v-else>
            <Input ref="focusInput" v-model="valueObj" @on-change="updateValue"  :disabled="disabled" type="textarea"  :rows="formItem.componentParams.rows||3"  :autosize="formItem.componentParams.autosize||{minRows: 3, maxRows: 10 }"
                   :placeholder="formItem.componentParams.placeholder"></Input>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import contextHelper from "../../../libs/context";
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:[Object,Array]
        }
    },
    data: function(){
        return {
            valueObj:this.convertedValue(),
            changedQueue:[],
            errorObj:{jsonError:true}
        };
    },
    watch:{
        "value":function (newV,oldV) {
            if(!_.isEqual(newV,oldV)){
                //如果json格式错误，不会转换
                if(this.value&&_.isPlainObject(this.value)&&this.value.jsonError){
                    return;
                }
                this.valueObj=this.convertedValue();
            }
        }
    },
    methods: {
        updateValue: function ($event) {
            contextHelper.getMvueToolkit().utils.smartAction(this,"changedQueue",()=>{
                try{
                    let _value=this.strToJson(this.valueObj);
                    this.$emit('input',_value);
                }catch(err){
                    //如果json格式错误，抛出jsonError错误对象
                    this.$emit('input',this.errorObj);
                }
            },200);
            
        },
        strToJson(str){
            if(!str){
                return null;
            }
            let jsonObj=JSON.parse(str);
            return jsonObj;
        },
        jsonToStr(jsonObj){//由外部对象转换成json字符串，如果对象不是合法的json将被置空
            if(!jsonObj){
                return '';
            }
            try{
                let str=JSON.stringify(jsonObj);
                return str;
            }catch(err){
                console.error(err);
                if(_.isArray(jsonObj)){
                    return '[]';
                }else{
                    return '{}';
                }
            }
        },
        convertedValue(){
            return this.jsonToStr(this.value);
        }
    }
}
</script>


