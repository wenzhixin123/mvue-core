<template>
    <div>
        <template v-if="viewMode">
                <div class="form-item-view" v-text="valueObj||emptyText" :title="valueObj||emptyText"></div>
        </template>
        <template v-else>
            <TimePicker transfer
            v-model="valueObj" 
            @on-change="handleChange" 
            :readonly="disabled" :disabled="disabled" :format="timeFormat" :placeholder="formItem.componentParams.placeholder"></TimePicker>
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
        "value":{type:String,default:null}
    },
    data: function(){
        return {
            valueObj:null
        };
    },
    computed:{
        timeFormat:function(){
            let timePrecision=this.formItem.componentParams.timePrecision;
            if(this.controlTypeService.timePrecision.minute===timePrecision){
                return "HH:mm";
            }else{
                return "HH:mm:ss";
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
                var nowDs=dayjs().format('YYYY-MM-DD');
                let _d=dayjs(`${nowDs} ${data}`);
                let dv=_d.format(_this.timeFormat);
                _this.handleChange(dv);
            });
        },
        getValidPart:function(){//将传进来的值value转成特定的格式
            let timePrecision=this.formItem.componentParams.timePrecision;
            let _valueValidPart=dateType.formatTime(this.value,timePrecision);
            return _valueValidPart;
        },
        handleChange:function(newDate){//最终都转成完整的时间格式
            if(!newDate){
                this.$emit("input",null);
                return;
            }
            var nowDs=dayjs().format('YYYY-MM-DD');
            let _d=dayjs(`${nowDs} ${newDate}`);
            this.$emit("input",_d.format('HH:mm:ss'));
        }
    }
}
</script>


