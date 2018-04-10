<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <Multiselect v-model="selectedItem"
                        :options="dataItems"
                        placeholder="选择"
                        :disabled="disabled"
                        select-label="按enter键选择"
                        selected-label="已选"
                        deselect-label="按enter键取消选择"
                        :show-no-results="false"
                        :label="getTitleField()"
                        @select="onSelect"
                        @remove="onRemove"
                        @search-change="searchChange"
                        :track-by="getIdField()">
                <template slot="option" slot-scope="props">
                    <div class="option__desc">
                        <span class="option__title">{{ props.option[formItem.componentParams.titleField] }}</span>
                    </div>
                </template>
            </Multiselect>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{type:String,default:null}
    },
    data: function(){
        var entityResource=null;
        if(this.formItem.componentParams&&this.formItem.componentParams.entityResourceUrl){
            entityResource= Vue.resource(this.formItem.componentParams.entityResourceUrl,null,null,null);
        }
        return {
            selectedItem:null,//已经选择的项
            dataItems:[],//远程获取的数据项
            entityResource:entityResource,//获取实体数据的操作resource
        };
    },
    computed:{
        dataItemsMap:function(){
            var idField=this.getIdField();
            return _.keyBy(this.dataItems,idField);
        }
    },
    watch:{
        value:function(newV,oldV){
            if(newV){
                this.selectedItem=this.dataItemsMap[newV]||null;
            }else{
                this.selectedItem=null;
            }
        },
        dataItems:function(){
            if(this.value){
                this.selectedItem=this.dataItemsMap[this.value]||null;
            }
        }
    },
    mounted:function(){
        this.doSearch();
    },
    methods: {
        onSelect:function(selectItem){
            var idField=this.getIdField();
            var titleField=this.getTitleField();
            var exData=this.buildExData(selectItem[titleField]);
            this.emitExData(selectItem[idField],exData);
            this.$emit('input',selectItem[idField]);
        },
        onRemove:function(item){
            this.selectedItem=null;
            this.$emit('input',null);
        },
        searchChange:function(keyword){
            var _this=this;
            this.doSearch(keyword,function(){
                _this.selectedItem=null;
            });
        },
        doSearch:function(keyword,callback){
            var _this=this;
            var params={};
            if(!keyword){
                params.limit=50;
                if(this.value){
                    params.filters=`${this.formItem.componentParams.idField} eq ${this.value}`;
                }
            }else{
                params.filters=`${this.formItem.componentParams.titleField} like %${keyword}%`;
            }
            if(this.entityResource){
                Utils.smartSearch(_this,function(){
                    _this.entityResource.query(params)
                    .then(function({data}){
                        _this.dataItems=data;
                        callback&&callback();
                    });
                });
            }
        },
        getIdField:function(){
            return this.formItem.componentParams.idField;
        },
        getTitleField:function(){
            return this.formItem.componentParams.titleField;
        },
        emitExData:function(id,data){
            var exData={};
            exData[id]=data;
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


