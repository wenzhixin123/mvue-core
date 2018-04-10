<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <Multiselect v-model="selectedItem"
                        :options="dataItems"
                        placeholder="选择部门"
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
                        <span class="option__title">{{ props.option.name }}</span>
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
                    <Multiselect v-model="selectedItem"
                        :options="dataItems"
                        placeholder="选择部门"
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
                                <span class="option__title">{{ props.option.name }}</span>
                            </div>
                        </template>
                    </Multiselect>
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
        let entityResource=null;
        if(this.paths&&this.paths.orgApiUrl){
            entityResource= Vue.resource(this.paths.orgApiUrl);
        }
        return {
            selectedItem:null,//已经选择的项
            dataItems:[],//远程获取的数据项
            entityResource:entityResource,//获取部门数据的操作resource
            queryFields:"id,name,ecode"//查询的冗余数据
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
        },
        "paths.orgApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            var _this=this;
            if(newValue){
                this.entityResource= Vue.resource(newValue);
                this.doSearch();
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
            var exData=this.buildExData(selectItem[titleField]);;
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
            var params={select:_this.queryFields};
            if(!keyword){
                if(this.value){
                    let idField=this.getIdField();
                    params.filters=`${idField} eq ${this.value}`;
                }else{
                    params.limit=50;
                }
            }else{
                params.filters=`status eq 1 and name like %${keyword}%`;
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
            return "id";
        },
        getTitleField:function(){
            return "name";
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


