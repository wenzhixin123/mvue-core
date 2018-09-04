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
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    data: function(){
        let entityResource=null;
        if(this.paths&&this.paths.orgApiUrl){
            entityResource= context.buildResource(this.paths.orgApiUrl);
        }
        return {
            innerValue:_.cloneDeep(this.value),
            innerText:"",
            entityResource:entityResource
        };
    },
    watch:{
        value:function(){
            if(!_.isEqual(this.value,this.innerValue)){
                this.initValue();
            }
        }
    },
    mounted:function(){
        if(this.value){
            this.initValue();
        }
    },
    methods: {
        initValue(){
            this.innerValue=_.cloneDeep(this.value);
            let innerTextArray=[];
            let _this=this;
            _.each(this.innerValue,function(v){
                let exData=_this.getExData(v);
                if(exData){
                    innerTextArray.push(exData);
                }
            });
            this.innerText=innerTextArray.join(",");
            //如果id为空，显示文本也应该清空
            if(!this.innerValue||this.innerValue.length===0){
                this.innerText="";
            }
        },
        onSelect:function(selectItems){
            let valueArray=[],textArray=[];
            let _this=this;
            var idField=this.getIdField();
            var titleField=this.getTitleField();
            var exData={};
            _.each(selectItems,function(selectItem){
                let value=selectItem[idField];
                let text=selectItem[titleField];
                valueArray.push(value);
                textArray.push(text);
                exData[value]=_this.buildExData(text);
            });
            this.innerValue=valueArray;
            this.innerText=textArray.join(",");
            this.$emit('input',this.innerValue);
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        },
        onRemove:function(item){
            this.innerValue=[];
            this.innerText="";
            this.$emit('input',[]);
        },
        getIdField:function(){
            return "id";
        },
        getTitleField:function(){
            return "name";
        },
        showPcLinkSelectModal(){
            var _this=this;
            linkplugin.selectContact({
                onlySelectOrg:true,
                callback:function(res){
                    if(res){
                        _this.onSelect(res);
                    }
                }
            });
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


