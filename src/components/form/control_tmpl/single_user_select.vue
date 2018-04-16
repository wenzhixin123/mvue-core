<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItem)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="selectedItem&&selectedItem[getTitleField()]"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <Multiselect v-model="selectedItem"
                        :options="dataItems"
                        :placeholder="formItem.componentParams.placeholder||'请输入用户姓名'"
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
                        <span>-</span>
                        <span class="option__small">{{ props.option.email||props.option.loginId }}</span>
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
                        placeholder="选择用户"
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
                                <span>-</span>
                                <span class="option__small">{{ props.option.email||props.option.loginId }}</span>
                            </div>
                        </template>
                    </Multiselect>
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                </div>
            </div>
        </div>
        </template>
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
        if(this.paths&&this.paths.userApiUrl){
            entityResource= Vue.resource(this.paths.userApiUrl);
        }
        return {
            selectedItem:null,//已经选择的项
            dataItems:[],//远程获取的数据项
            entityResource:entityResource,//获取用户数据的操作resource
            queryFields:"userId,name,mobile,loginId,email,orgId",//查询的冗余数据
            cachedDataItems:null//默认提示的可选数据
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
        "paths.userApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            var _this=this;
            if(newValue){
                this.entityResource= Vue.resource(newValue);
                this.firstSearch();
            }
        },
    },
    mounted:function(){
        this.firstSearch();
    },
    methods: {
        firstSearch(){
            let _this=this;
            this.doSearch(null,function(){//默认值填充
                if(_this.shouldInitDefault()){
                    _this.calcField().then((data)=>{
                        if(!data){
                            return;
                        }
                        _this.setCurrentUserIfCreate(data);
                    });
                }
            });
        },
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
        doSearchForCache:function(callback){
            if(this.cachedDataItems){
                callback&&callback(this.cachedDataItems);
                return;
            }
            var _this=this;
            var params={select:_this.queryFields};
            params.limit=5;
            params.filters=`status eq 1`;
            if(this.entityResource){
                Utils.smartSearch(_this,function(){
                    _this.entityResource.query(params)
                    .then(function({data}){
                        _this.cachedDataItems=data;
                        callback&&callback(data);
                    });
                });
            }
        },
        doSearch:function(keyword,callback){
            var _this=this;
            var params={select:_this.queryFields};
            debugger
            if(!keyword){
                if(this.value){
                    let idField=this.getIdField();
                    params.filters=`${idField} eq ${this.value}`;
                }else{
                    params.limit=5;
                }
            }else{
                params.filters=`status eq 1 and name like '%${keyword}%'`;
            }
            if(this.entityResource){
                Utils.smartSearch(_this,function(){
                    _this.entityResource.query(params)
                    .then(function({data}){
                        if(_this.value){//此时需要补充缓存的数据进去
                            let id=_this.getIdField();
                            _this.doSearchForCache(function(citems){
                                let has=_.find(citems, function(o) { return o[id] ===data[0][id]; });
                                if(has){//如果当前值在缓存中
                                    _this.dataItems=citems;
                                }else{
                                    _this.dataItems=citems.concat(data);
                                }
                                callback&&callback();
                            });
                        }else{
                            _this.dataItems=data;
                            callback&&callback();
                        }
                    });
                });
            }
        },
        getIdField:function(){
            return "userId";
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


