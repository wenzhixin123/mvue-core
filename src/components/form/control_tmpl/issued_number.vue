<template>
    <div>
        <template v-if="viewMode">
            <div v-text="issuedObjcet.fullText||emptyText"></div>
        </template>
        <template v-else>
            <div>
                <div class="issued_align">
                    <div class="col-md-3 _p0">
                        <Select align="left" v-if="formItem.componentParams.standard=='standard2'" v-model="issuedObjcet.code" :disabled="disabled" :placeholder="formItem.componentParams.selectText" @on-change="updateValue">
                            <Option v-for="item in formItem.componentParams.options" :key="item.id" :value="item.id">{{ item.text }}</Option>
                        </Select>
                        <input v-else v-model="issuedObjcet.code" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">[</div>
                    <div class="col-md-3" align="left">
                        <input v-model="issuedObjcet.year" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">]</div>
                    <div class="col-md-3">
                        <input v-model="issuedObjcet.number" :disabled="disabled" type="text" class="form-control" @input="updateValue" :placeholder="formItem.componentParams.placeholder">
                    </div>
                    <div class="col-md-1 issued_align">号</div>
                </div>
                <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
            </div>
            
        </template>
    </div>
</template>
<script>
    import controlBase from '../js/control_base';
    export default {
        mixins: [controlBase],
        props: {
            "value":[Object,String]
        },
        data(){
            return {
                issuedObjcet:{
                    fullText:"",
                    code:"",
                    year:"",
                    number:""
                }
            }
        },
        watch:{
            "value":function(newV,oldV){
                var _issuedObjcet=this.issuedObjcet
                if(newV){
                    Object.assign(_issuedObjcet,newV)
                }
            },
            "formItem.componentParams.standard"(newV){
                //监听标准切换
                this.issuedObjcet.code = "";
                this.$emit('input',"");
            },
            "formItem.componentParams.options"(newV){
                //监听选项改变
                this.initDefault()
            }
        },
        mounted:function(){
            if(!_.isEmpty(this.value)){
                this.issuedObjcet=_.cloneDeep(this.value);
            }else{
                this.$emit('input',"");
                this.initDefault();
            }
        },
        methods: {
            updateValue: function () {
                let _issuedObjcet = Object.assign({},this.issuedObjcet);
                _issuedObjcet.fullText = "";
                if(this.formItem.componentParams.standard=="standard2"){
                    _.each(this.formItem.componentParams.options,function(option){
                        if(option.checked){
                            _issuedObjcet.code = option.text
                        }
                    });
                }//处理类型2的存储格式
                _issuedObjcet.fullText = _.values(_issuedObjcet).join("");
                this.issuedObjcet.fullText = _issuedObjcet.fullText;
                if(_.every(_.values(_issuedObjcet))){
                    this.$emit('input',this.issuedObjcet);
                }else{
                    this.$emit('input',"");
                }
            },
            initDefault:function(){
                var _this=this;
                if(this.formItem.componentParams.standard!="standard2")return false;
                _this.issuedObjcet.code = "";
                _.each(this.formItem.componentParams.options,function(option){
                    if(option.checked){
                        _this.issuedObjcet.code=option.id;
                        _this.$emit('input',_this.issuedObjcet);
                        return false;
                    }
                });
            }
        }
    }
</script>
<style lang="less" scoped>
.issued_align{  height: 33px; line-height: 33px; text-align: center }
._p0{ padding-left: 0;}
</style>


