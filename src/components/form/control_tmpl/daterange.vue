<div>
    <div>
        <template v-if="viewMode">
            <div v-text="valueObj"></div>
        </template>
        <template v-else>
                <DatePicker transfer
                            v-model="valueObj"
                            type="daterange"
                            @on-change="handleChange"
                            :readonly="disabled" :disabled="disabled" :placeholder="formItem.componentParams.placeholder"></DatePicker>
        </template>
</div>
<script>
var moment = require('moment'); 
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
            let datePrecision=this.formItem.componentParams.datePrecision;
            if(this.value&&this.value.length==2){
                if(!this.value[0]||!this.value[1]){
                    return null;
                }
                let _valueValidPartLeft=dateType.formatDate(this.value[0],datePrecision);
                let _valueValidPartRight=dateType.formatDate(this.value[1],datePrecision);
                return [_valueValidPartLeft,_valueValidPartRight];
            }
            return null;
        },
        handleChange:function(newDate){//最终都转成完整的日期格式
            if(!newDate[0]||!newDate[1]){
                this.$emit("input",null);
                return;
            }
            let datePrecision=this.formItem.componentParams.datePrecision;
            let _dleft=null,_dright=null;
            if(this.controlTypeService.datePrecision.year===datePrecision){
                _dleft=moment(newDate[0],'YYYY');
                _dright=moment(newDate[1],'YYYY');
            }else if(this.controlTypeService.datePrecision.month===datePrecision){
                _dleft=moment(newDate[0],'YYYY-MM');
                _dright=moment(newDate[1],'YYYY-MM');
            }else{
                _dleft=moment(newDate[0],'YYYY-MM-DD');
                _dright=moment(newDate[1],'YYYY-MM-DD');
            }
            this.$emit("input",[_dleft.format('YYYY-MM-DD'),_dright.format('YYYY-MM-DD')]);
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


