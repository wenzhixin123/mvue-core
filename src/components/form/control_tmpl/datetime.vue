<template>
    <div>
        <template v-if="viewMode">
            <div v-text="valueObj"></div>
        </template>
        <template v-else>
            <DatePicker
            v-model="valueObj" 
            @on-change="handleChange"
            :readonly="disabled" :disabled="disabled" type="datetime" :format="dateTimeFormat" :placeholder="formItem.componentParams.placeholder"></DatePicker>
        </template>
    </div>
</template>
<script>
var moment = require('moment'); 
import controlBase from '../js/control_base';
import dateType from '../js/date_type';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:String,default:null}
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
                return "yyyy-MM-dd HH:mm:ss";//moment YYYY-MM-DD HH:mm:ss
            }
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _valueValidPart=this.getValidPart();
            if(_valueValidPart!==this.valueObj){
                this.valueObj=_valueValidPart;
                this.$emit("input",_valueValidPart);
            }
        }
    },
    mounted:function(){
        if(this.value){
            var _valueValidPart=this.getValidPart();
            this.valueObj=_valueValidPart;
            this.handleChange(_valueValidPart);
        }
    },
    methods:{
        initDefaultByType(){
            let _this=this;
            this.calcField().then((data)=>{
                if(!data){
                    return;
                }
                let dv=moment(data).format(Utils.getMomentFormat(_this.dateTimeFormat));
                _this.handleChange(dv);
            });
        },
        getValidPart:function(){//将传进来的值value转成特定的格式
            //moment format YYYY-MM-DD HH:mm:ss
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _valueValidPart=dateType.formatDateTime(this.value,timePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的日期时间格式
            if(!newDate){
                this.$emit("input",null);
                return;
            }
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _d=moment(newDate,Utils.getMomentFormat(this.dateTimeFormat));
            this.$emit("input",_d.format('YYYY-MM-DD HH:mm:ss'));
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


