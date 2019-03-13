<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItem)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="viewModeValue()"></div>
            </div>
        </template>
        <template v-else>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <Multiselect :multiple="true" v-model="selectedItem"
                        :options="dataItems"
                        :placeholder="formItem.componentParams.placeholder||'请输入部门名称'"
                        :disabled="disabled"
                        select-label="按enter键选择"
                        selected-label="已选"
                        deselect-label="按enter键取消选择"
                        :show-no-results="false"
                        label="name"
                        @select="onSelect"
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
                    <Multiselect :multiple="true" v-model="selectedItem"
                        :options="dataItems"
                        placeholder="选择部门"
                        :disabled="disabled"
                        select-label="按enter键选择"
                        selected-label="已选"
                        deselect-label="按enter键取消选择"
                        :show-no-results="false"
                        label="name"
                        @select="onSelect"
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
        </template>
    </div>
</template>
<script>
import mvueToolkit from 'mvue-toolkit';
import controlBase from '../js/control_base';
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
            entityResource= mvueToolkit.resource(this.paths.orgApiUrl);
        }
        return {
            userSelected:false,
            selectedItem:[],//已经选择的项
            dataItems:[],//远程获取的数据项
            entityResource:entityResource,//获取部门数据的操作resource
            queryFields:"id,name",//查询的冗余数据
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
            var _this=this;
            if(this.userSelected){
                return;
            }
            if(newV){//多选为数组
                _.each(newV,function(v){
                    let item=_this.dataItemsMap[v]||null;
                    if(item){
                        _this.selectedItem.push(item);
                    }
                });
            }else{
                this.selectedItem=[];
            }
        },
        dataItems:function(){
            var _this=this;
            if(this.value&&!this.searchchange){
                _.each(this.value,function(v){
                    let item=_this.dataItemsMap[v]||null;
                    if(item){
                        _this.selectedItem.push(item);
                    }
                });
            }
        },
        "paths.orgApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            var _this=this;
            if(newValue){
                this.entityResource= mvueToolkit.resource(newValue);
                this.doSearch();
            }
        },
        "selectedItem":function(){
            var _this=this;
            if(this.selectedItem&&this.userSelected){
                var idField=this.getIdField();
                var exData={};
                var sIds=[];
                var titleField=this.getTitleField();
                _.each(this.selectedItem,function(sitem){
                    var sid=sitem[idField];
                    sIds.push(sid);
                    var exDataItem=_this.buildExData(sitem[titleField]);
                    exData[sid]=exDataItem;
                });
                this.emitExData(exData);
                this.$emit('input',sIds);
            }
        }
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
                    _this.setCurrentOrgIfCreate(data,_this.selectedItem);
                });
                }
            });
        },
        onSelect:function(selectedItems){
            this.userSelected=true;
        },
        searchChange:function(keyword){
            var _this=this;
            this.doSearch(keyword,function(){
                //_this.selectedItem=null;
                _this.userSelected=false;
                _this.searchchange=true;
            });
        },
        doSearchForCache:function(callback){
            if(this.cachedDataItems){
                callback&&callback(this.cachedDataItems);
                return;
            }
            var _this=this;
            var params={select:_this.queryFields};
            params.limit=50;
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
            if(!keyword){
                if(this.value&&this.value.length>0){
                    let idField=this.getIdField();
                    let values=this.value.join(",");
                    params.filters=`${idField} in ${values}`;
                }else{
                    params.limit=50;
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
                                let _dataItems=_.cloneDeep(citems);
                                _.each(data,function(dataItem){
                                    let has=_.find(citems, function(o) { return o[id] ===dataItem[id]; });
                                    if(!has){//如果当前值不在缓存中
                                        _dataItems.push(dataItem);
                                    }
                                });
                                _this.dataItems=_dataItems;
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
            return "id";
        },
        getTitleField:function(){
            return "name";
        },
        emitExData:function(exData){
            this.$emit("exDataChanged",exData,this.formItem.dataField);
        },
        viewModeValue(){
            if(this.selectedItem&&this.selectedItem){
                let texts=[];
                let _this=this;
                _.each(this.selectedItem,function(item){
                    let id=item[_this.getIdField()];
                    let exValue=_this.getExData(id);
                    texts.push(exValue);
                });
                return texts.join(",");
            }
            return "";
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


