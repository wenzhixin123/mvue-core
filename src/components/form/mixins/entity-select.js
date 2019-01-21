import context from '../../../libs/context';
export default{
    data(){
        return {
            isLoading:false,
            dataItems:[],//远程获取的数据项
            selectedItem:null,//已经选择的项
            queryFields:null,
            queryLimit:10,
            historyItems:[],//选中过的历史选项
            cachedDataItems:null,//默认提示的可选数据
            viewModeValue:"",
            preselectFirst:false
        };
    },
    computed:{
        dataItemsMap:function(){
            var idField=this.getIdField();
            return _.keyBy(this.dataItems,function(item){return item[idField];});
        },
        multiple(){
            return _.isArray(this.selectedItem);
        }
    },
    watch:{
        //监听selectedItem的变化，选中过的数据加入到历史选项
        selectedItem:{
            handler(){
                this.addHistoryItems();
                if(_.isArray(this.selectedItem)){
                    this.notifyMultipleSelect();
                }else{
                    this.notifySingleSelect();
                    //向metaForm的refEntities写入引用数据
                    var metaForm=this.getParentForm&&this.getParentForm();
                    if(metaForm&&this.formItem){
                        this.$store.commit("core/setFormRefEntities",{
                            id:metaForm.id,
                            name:this.formItem.dataField,
                            refEntity:this.selectedItem
                        });
                    }
                }
            },
            immediate:true
        },
        value(newV,oldV){
            //特殊处理：外部v-model设置值回传进来
            if(_.isEmpty(newV)&&(!_.isEmpty(oldV))){
                if(_.isArray(oldV)){
                    this.selectedItem=[];
                }else{
                    this.selectedItem=null;
                }
            }else if((!_.isEmpty(newV))&&(!_.isEqual(newV,oldV))){
                this.firstInit();
            }
        }
    },
    mounted:function(){
        this.firstInit();
    },
    methods:{
        firstInit(){
            this.firstSearch();
            this.doSearchForCache((items) => {
                this.ensureHistoryItems(items);
                if(this.selectedItem==null && this.preselectFirst
                    && items && items.length>0){
                    this.selectedItem=items[0];
                }
                if(this.onEntitySelectInited){
                    this.onEntitySelectInited();
                }
            });
            if(this.viewMode){
                this.getViewModeValue()
            }
        },
        //第一次进入页面时执行初始化
        firstSearch(){
            let _this=this;
            if(this.value){
                _this.initSelectedItemByFirstValue(this.value);
                return;
            }
             //默认值填充
            if(this.shouldInitDefault&&this.shouldInitDefault()){
                this.calcField().then((data)=>{
                    if(!data){
                        return;
                    }
                    _this.initSelectedItemByFirstValue(data);
                });
            }
        },
        //单选
        notifySingleSelect:function(){
            var idField=this.getIdField();
            var sid=null;
            if(this.selectedItem){
                sid=this.selectedItem[idField];
            }
            if(this.selectedItemChanged){
                this.selectedItemChanged(sid);
            }
            this.$emit('input',sid);
            this.dispatch&&this.dispatch('FormItem', 'on-form-change', sid);
        },
        //多选
        notifyMultipleSelect(){
            var idField=this.getIdField();
            var sIds=[];
            _.each(this.selectedItem,(sitem)=>{
                var sid=sitem[idField];
                sIds.push(sid);
            });
            this.$emit('input',sIds);
            this.dispatch&&this.dispatch('FormItem', 'on-form-change', sIds);
        },
        //查询指定ids的数据并初始化选中值
        initSelectedItemByFirstValue:function (val) {
            if(_.isEmpty(val)&&(!_.isNumber(val))){
                return;
            }
            var _this=this;
            this.searchByIds(val,function (items) {
                if(items.length>0){
                    let multiple=_.isArray(val);
                    if(multiple){
                        _this.selectedItem=items;
                    }else{
                        _this.selectedItem=items[0];
                    }
                }
            });
        },
        //确保被选过的数据在下拉列表中
        addHistoryItems:function () {
            if(!_.isEmpty(this.selectedItem)){
                let sItems=this.selectedItem;
                if(!_.isArray(this.selectedItem)){
                    sItems=[this.selectedItem];
                }
                let idField=this.getIdField();
                let histMap=_.keyBy(this.historyItems,item=>{
                    return item[idField];
                });
                _.each(sItems,item=>{
                    if(!histMap[item[idField]]){
                        this.historyItems.splice(0,0,item);
                    }
                });
            }
        },
        //保证历史选项合并到新的items选项中
        ensureHistoryItems(items){
            var itemsMap=_.keyBy(items,item=>{
                return item[this.getIdField()];
            });
            _.each(this.historyItems,item=>{
                if(!itemsMap[item[this.getIdField()]]){
                    items.splice(0, 0, item);
                }
            });
            this.dataItems=items;
        },
        //必须由具体选择组件重写
        buildQueryOptions(params,keyword){
            
        },

        //根据已选ids查询数据
        searchByIds(ids,callback){
            let idField=this.getIdField();
            let filters=ids;
            if(_.isArray(ids)){
                filters=ids.join(",");
            }
            var queryOptions={
                filters:`${idField} in ${filters}`
            }
            if(!this.multiple){
                queryOptions.expand=this.buildQueryExpand();
            }
            if(this.entityResource){
                this.entityResource.query(queryOptions).then(function({data}){
                    callback&&callback(data);
                });
            }
        },
        //刚进入界面时，先查询一部分数据作为下拉可选的数据
        doSearchForCache:function(callback){
            if(this.cachedDataItems){
                callback&&callback(this.cachedDataItems);
                return;
            }
            var _this=this;
            var params={select:_this.queryFields};
            if(!this.multiple){
                params.expand=this.buildQueryExpand();
            }
            params.limit=this.queryLimit+1;
            //如果是关键字查询，附加查询条件查询
            this.buildQueryOptions(params,"");
            if(this.entityResource){
                context.getMvueToolkit().utils.smartSearch(_this,function(){
                    _this.entityResource.query(params)
                    .then(function({data}){
                        var valData=data;
                        if(valData.length>_this.queryLimit){
                            var lastItem=valData[valData.length-1];
                            _.forIn(lastItem,(val,key)=>{
                                lastItem[key]="...";
                            });
                            lastItem["$isDisabled"]=true;
                        }
                        _this.cachedDataItems=data;
                        callback&&callback(data);
                    });
                });
            }
        },
        //当输入关键字搜索时会执行此查询
        doSearch:function(keyword,callback){
            var _this=this;
            var params={select:_this.queryFields};
            if(!this.multiple){
                params.expand=this.buildQueryExpand();
            }
            if(!keyword){
                _this.doSearchForCache(items=>{
                    this.ensureHistoryItems(items);
                    callback&&callback(data);
                });
                return;
            }else{
                //如果是关键字查询，附加查询条件查询
                this.buildQueryOptions(params,keyword);
            }
            if(this.entityResource){
                context.getMvueToolkit().utils.smartSearch(_this,function(){
                    _this.entityResource.query(params)
                    .then(function({data}){
                        _this.ensureHistoryItems(data);
                        callback&&callback(data);
                    });
                },"changedQueue");
            }
        },
        //获取查看模式的显示数据
        getViewModeValue(){
            if(_.isArray(this.value)){
                let textsPromise=this.getEntityExData(this.value);
                textsPromise.then(texts=>{
                    this.viewModeValue=texts.join(",");
                });
            }else{
                this.getEntityExData(this.value).then(text=>{
                    this.viewModeValue=text;
                });
            }
        },
        searchChange:function(keyword){
            this.doSearch(keyword);
        },
        buildQueryExpand(){//构建查询时，所有引用字段展开条件，m-expand表单控件需要使用
            let entityName=this.formItem&&this.formItem.componentParams.entityId;
            //特殊处理单选用户和单选部门组件
            if(!entityName){
                entityName=this.getEntityName&&this.getEntityName();
            }
            if(entityName){
                let metaEntity =this.$metaBase.findMetaEntity(entityName);
                let _fields=metaEntity.getDefaultViewFields();
                let _expand=metaEntity.getExpand(_fields);
                return _expand;
            }
            return '';
        }
    }
}