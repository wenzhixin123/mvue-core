<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(innerText)">
                <div v-text="innerText"></div>
            </div>
        </template>
        <template v-else>
            <div class="ivu-input-wrapper ivu-input-type ivu-input-group ivu-input-group-with-prepend ivu-input-group-with-append ivu-input-hide-icon link-select-userorg">
                <input readonly type="text" class="ivu-input" :value="innerText"> 
                <input type="hidden" class="ivu-input" :value="innerValue"> 
                <div class="ivu-input-group-append">
                    <Button  icon="ios-search" class="btn-search" @click="showPcLinkSelectModal"></Button>
                </div>
                <Button icon="ios-close" type="text" class="btn-remove" @click="onRemove">
                </Button>
            </div>
        </template>
    </div>
</template>
<script>
import context from '../../../libs/context';
import controlBase from '../js/control_base';
var linkplugin=require('../../../services/link/linkplugin');
export default {
    mixins: [controlBase],
    props: {
        "value":{type:String,default:null}
    },
    data: function(){
        let entityResource=null;
        if(this.paths&&this.paths.userApiUrl){
            entityResource= context.buildResource(this.paths.userApiUrl);
        }
        return {
            innerValue:this.value,
            innerText:null,
            entityResource:entityResource
        };
    },
    watch:{
        value:function(){
            if(this.value!==this.innerValue){
                this.initValue();
            }
        }
    },
    mounted:function(){
        var _this=this;
        if(this.value){
            this.initValue();
        }else{
            if(_this.shouldInitDefault()){
                _this.calcField().then((data)=>{
                    if(!data){
                        return;
                    }
                    _this.setCurrentUserIfCreate(data);
                });
            }
        }
    },
    methods: {
        initValue(){
            this.innerValue=this.value;
            let exData=this.getExData(this.innerValue);
            if(exData){
                this.innerText=exData;
            }
            //如果id为空，显示文本也应该清空
            if(!this.innerValue){
                this.innerText="";
            }
        },
        onSelect:function(selectItem){
            var idField=this.getIdField();
            var titleField=this.getTitleField();
            this.innerValue=selectItem[idField];
            this.innerText=selectItem[titleField];
            var exData=this.buildExData(this.innerText);
            this.emitExData(this.innerValue,exData);
            this.$emit('input',this.innerValue);
        },
        onRemove:function(item){
            this.innerValue=null;
            this.innerText=null;
            this.$emit('input',null);
        },
        getIdField:function(){
            return "id";
        },
        getTitleField:function(){
            return "name";
        },
        emitExData:function(id,data){
            var exData={};
            exData[id]=data;
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        },
        showPcLinkSelectModal(){
            var _this=this;
            linkplugin.selectContact({
                onlySelectOne:true,
                callback:function(res){
                    if(res&&res[0]){
                        _this.onSelect(res[0]);
                    }
                }
            });
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


