<template>
    <div class="password-con">
        <template v-if="viewMode">
                <div>********</div>
        </template>
        <template v-else>
            <template v-if="formItem.componentParams.showBtn">
                <div class="bvue-select-wrapper bvue-select-group bvue-select-with-append" style='line-height:30px;'>
                    <Input v-if="textShowed" v-model="valueObj" @input="updateValue"  :disabled="disabled" type="text"  :placeholder="formItem.componentParams.placeholder">
                        <Icon type="ios-eye-off" slot="suffix" @click="hideText"/>
                    </Input>
                    <Input v-if="!textShowed" v-model="valueObj" @input="updateValue"  :disabled="disabled" type="password"  :placeholder="formItem.componentParams.placeholder">
                        <Icon type="ios-eye" slot="suffix" @click="showText"/>
                    </Input>
                    <Button class="bvue-select-group-append" type="default" @click="updateSecret()">更新</Button>
                </div>
            </template>
            <template v-else>
                <Input v-if="textShowed" v-model="valueObj" @input="updateValue"  :disabled="disabled" type="text"  :placeholder="formItem.componentParams.placeholder">
                    <Icon type="ios-eye-off" slot="suffix" @click="hideText"/>
                </Input>
                <Input v-if="!textShowed" v-model="valueObj" @input="updateValue"  :disabled="disabled" type="password"  :placeholder="formItem.componentParams.placeholder">
                    <Icon type="ios-eye" slot="suffix" @click="showText"/>
                </Input>
            </template>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import globalContext from '../../../libs/context';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:String
        }
    },
    data: function(){
        return {
            valueObj:this.value,
            textShowed:false
        };
    },
    watch:{
      "value":function (newV,oldV) {
          this.valueObj=newV;
      }
    },
    mounted:function(){
        if(this.isFixedValue()){
            let _this=this;
            this.initFixedField(function(data){
                _this.$emit('input',data);
            });
        }
    },
    methods: {
        updateValue: function ($event) {
            this.$emit('input',this.valueObj);
        },
        showText(){
            this.textShowed=true;
        },
        hideText(){
            this.textShowed=false;
        },
        updateSecret(){
            var length=(this.formItem.componentParams.limitLength&&this.formItem.componentParams.limitLength.maxLength)||20;
            var randomStr=globalContext.getMvueToolkit().utils.randomString(length);
            this.valueObj=randomStr;
        }
    }
}
</script>
<style lang="scss" scoped>
.password-con .ivu-input-wrapper .ivu-icon:hover{
    cursor: pointer;
}
</style>


