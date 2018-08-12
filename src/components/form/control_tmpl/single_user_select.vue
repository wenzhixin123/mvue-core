<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
                <div v-text="selectedItem&&selectedItem[getTitleField()]"></div>
        </template>
        <template v-else>
            <Multiselect v-model="selectedItem"
                        :options="dataItems"
                         :loading="isLoading"
                        :placeholder="formItem.componentParams.placeholder||'请输入用户姓名'"
                        :disabled="disabled"
                        select-label="按enter键选择"
                        selected-label="已选"
                        deselect-label="按enter键取消选择"
                        :show-no-results="true"
                         :internal-search="false"
                        :label="getTitleField()"
                        @select="onSelect"
                         @open="onOpen"
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
                        <template slot="noResult">
                            根据关键字，搜索不到任何用户
                        </template>
            </Multiselect>
        </template>
    </div>
</template>
<script>
import context from '../../../libs/context';
import controlBase from '../js/control_base';
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
            selectedItem:null,//已经选择的项
            dataItems:[],//远程获取的数据项
            entityResource:entityResource,//获取用户数据的操作resource
            queryFields:"userId,name,mobile,loginId,email,orgId",//查询的冗余数据
            cachedDataItems:null,//默认提示的可选数据
            isLoading:false
        };
    },
    computed:{
        dataItemsMap:function(){
            var idField=this.getIdField();
            return _.keyBy(this.dataItems,function(item){return item[idField];});
        }
    },
    watch:{
        value:function(newV,oldV){
            if(newV){
                this.initSelectedItem(newV);
            }
        },
        "paths.userApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            var _this=this;
            if(newValue){
                this.entityResource= context.buildResource(newValue);
                this.firstSearch();
            }
        },
    },
    mounted:function(){
        var _this=this;
        this.firstSearch();
        this.doSearchForCache(function(items)  {
            _this.dataItems=items;
        });
    },
    methods: {
        firstSearch(){
            let _this=this;
            if(this.value){
                _this.initSelectedItem(this.value);
                return;
            }
             //默认值填充
            if(this.shouldInitDefault()){
                this.calcField().then((data)=>{
                    if(!data){
                        return;
                    }
                    _this.initSelectedItem(data);
                });
            }
        },
        initSelectedItem:function (val) {
            var _this=this;
            let idField=_this.getIdField();
            var filterOption={
                filters:`${idField} eq ${val}`
            }
            this.doSearch(filterOption,function (items) {
                if(items.length>0){
                    _this.selectedItem=items[0];
                    if(_this.value!=val){

                        _this.onSelect(_this.selectedItem);
                    }
                }
            },false);
        },
        onSelect:function(selectItem){
            var idField=this.getIdField();
            var titleField=this.getTitleField();
            this.selectedItem=selectItem;
            var exData=this.buildExData(selectItem[titleField]);
            this.emitExData(selectItem[idField],exData);
            this.$emit('input',selectItem[idField]);
        },
        onOpen:function () {
            this.dataItems=this.ensureSelectedItem(this.dataItems);
        },
        onRemove:function(item){
            this.selectedItem=null;
            this.$emit('input',null);
        },
        searchChange:function(keyword){
            var _this=this;
            if(!keyword){
                this.doSearchForCache(function (items) {
                   _this.dataItems= items;
                });
            }else{
                var queryOption=`status eq 1 and (name like '%${keyword}%' or loginId  like '%${keyword}%')`;
                this.doSearch(queryOption,function (items) {
                    _this.dataItems=items;
                });
            }
        },
        doSearchForCache:function(callback){
            var _this=this;
            if(this.cachedDataItems){
                this.cachedDataItems=this.ensureSelectedItem(this.cachedDataItems);
                callback&&callback(this.cachedDataItems);
                return;
            }
            var queryOption={
                filters:  `status eq 1`,
                limit:6
            };
            this.doSearch(queryOption,(items) => {
                _this.cachedDataItems=_this.ensureSelectedItem(items);
                callback&&callback(_this.cachedDataItems);
            },false);
        },
        ensureSelectedItem:function (items) {
            if(this.selectedItem){
                var idField=this.getIdField();
                let has=_.find(items,(item) =>{
                    return item[idField]==this.selectedItem[idField];
                });
                if(!has){
                    items=[this.selectedItem].concat(items);
                }
            }
            return items;
        },
        doSearch:function(filterOption,callback,debounce){
            this.isLoading=true;
            var _this=this;
            if(_.isString(filterOption)){
                filterOption={filters:filterOption};
            }
            var params=_.extend({
                select:_this.queryFields,
            },filterOption);
            if(this.entityResource){
                if(debounce===false){
                    _this.entityResource.query(params)
                        .then(function({data}){
                            _this.isLoading=false;
                            callback&&callback(data);
                        });
                }else{
                    Utils.smartSearch(_this,function(){
                        _this.entityResource.query(params)
                            .then(function({data}){
                                _this.isLoading=false;
                                callback&&callback(data);
                            });
                    });
                }
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


