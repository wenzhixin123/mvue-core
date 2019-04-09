<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" v-text="valueObj||emptyText" :title="valueObj||emptyText"></div>
        </template>
        <template v-else>
            <DatePicker transfer
                v-model="valueObj" 
                @on-change="handleChange"
                :disabled="disabled" type="datetimerange" :format="dateTimeFormat" :placeholder="formItem.componentParams.placeholder"></DatePicker>
        </template>
    </div>
</template>
<script>
var dayjs = require("dayjs");
import controlBase from '../js/control_base';
import dateType from '../js/date_type';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:Array,default:null}
    },
    data: function(){
        return {
            valueObj:null
        };
    },
    computed:{
        dateTimeFormat:function(){
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                return "yyyy-MM-dd HH:mm";
            }else{
                return "yyyy-MM-dd HH:mm:ss";
            }
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _valueValidPart=this.getValidPart();
            if(!_.isEqual(_valueValidPart,this.valueObj)){
                this.valueObj=_valueValidPart;
                this.$emit("input",_valueValidPart);
            }
        }
    },
    mounted:function(){
        var _valueValidPart=this.getValidPart();
        this.valueObj=_valueValidPart;
    },
    methods:{
        getValidPart:function(){//将传进来的值value转成特定的格式
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.value&&this.value.length==2){
                if(!this.value[0]||!this.value[1]){
                    return null;
                }
                let _valueValidPartLeft=dateType.formatDateTime(this.value[0],timePrecision);
                let _valueValidPartRight=dateType.formatDateTime(this.value[1],timePrecision);
                return [_valueValidPartLeft,_valueValidPartRight];
            }
            return null;
        },
        handleChange:function(newDate){//最终都转成完整的日期时间格式
            if(!newDate[0]||!newDate[1]){
                this.$emit("input",null);
                return;
            }
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _dleft=dayjs(newDate[0]);
            let _dright=dayjs(newDate[1]);
            this.$emit("input",[_dleft.format('YYYY-MM-DD HH:mm:ss'),_dright.format('YYYY-MM-DD HH:mm:ss')]);
        }
    }
}
</script>


