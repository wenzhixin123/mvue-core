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
            viewModeValue:""
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
                }
            },
            immediate:true
        }
    },
    mounted:function(){
        var _this=this;
        this.firstSearch();
        this.doSearchForCache(function(items)  {
            _this.ensureHistoryItems(items);
        });
        if(this.viewMode){
            this.getViewModeValue()
        }
    },
    methods:{
        //第一次进入页面时执行初始化
        firstSearch(){
            let _this=this;
            if(this.value){
                _this.initSelectedItemByFirstValue(this.value);
                return;
            }
             //默认值填充
            if(this.shouldInitDefault()){
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
            this.$emit('input',sid);
            this.dispatch('FormItem', 'on-form-change', sid);
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
            this.dispatch('FormItem', 'on-form-change', sIds);
        },
        //查询指定ids的数据并初始化选中值
        initSelectedItemByFirstValue:function (val) {
            if(_.isEmpty(val)){
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
            params.limit=this.queryLimit;
            //如果是关键字查询，附加查询条件查询
            this.buildQueryOptions(params,"");
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
        //当输入关键字搜索时会执行此查询
        doSearch:function(keyword,callback){
            var _this=this;
            var params={select:_this.queryFields};
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
                Utils.smartSearch(_this,function(){
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
        }
    }
}