import metabase from '../../../libs/metadata/metabase';
import metaservice from '../../../services/meta/metaservice';
export default {
    data: function () {
        var entityName = this.$route.params.entityName;
        var metaEntity = metabase.findMetaEntity(entityName);
        return {
            header: {
                title: metaEntity.title,
                description: metaEntity.description,
                showBack: false
            },
            entityName: entityName,
            metaEntity: metaEntity,
            queryOptions: null,
            preprocessed: false,
            columns: null,
            toolbar:null,
            formShortId:null,//如果表单自定义过了，则表单也从自定义表单的formShortId获取
            viewShortId:null,//如果视图自定义过了，则视图列表也从自定义视图的viewShortId获取
            createPath:null,//视图表单创建地址
            editPath:null,//视图表单编辑地址
            viewPath:null//视图表单查看地址
        }
    },
    mounted: function () {
        this.initGrid();
    },
    beforeRouteUpdate: function (to, from, next) {
        var entityName = to.params.entityName;
        var metaEntity = metabase.findMetaEntity(entityName);
        this.entityName = entityName;
        this.header.title = metaEntity.title;
        this.header.description = metaEntity.description;
        next();
    },
    methods: {
        buildQueryFilters() {
            var query = this.$route.query;
            var metaEntity = this.metaEntity;
            //如果有查询条件，并且查询key是实体的字段，则加入到默认查询条件中
            let queryOptions = null;
            if (query) {
                let conditionArray = [];
                _.each(query, function (value, key) {
                    if (metaEntity.findField(key)) {
                        conditionArray.push(`${key} eq ${value}`);
                    }
                });
                if (conditionArray.length) {
                    let filters = conditionArray.join(" and ");
                    queryOptions = { filters: filters };
                }
            }
            return queryOptions;
        },
        buildDefaultOrderby() {
            let updatedAtField = this.metaEntity.firstSemanticsField("updatedAt");
            let orderby = null;
            if (updatedAtField) {//实体有更新时间字段，并且queryOptions没写，则按照更新时间降序排列
                orderby = `${updatedAtField.name} desc`;
            }
            return orderby;
        },
        initUrls(metaView){
            var settings=metaView.settings;
            if(settings&&settings.viewUrl){
                this.viewPath=settings.viewUrl;
            }
            if(settings&&settings.editUrl){
                this.editPath=settings.editUrl;
            }
            if(settings&&settings.createUrl){
                this.createPath=settings.createUrl;
            }
        },
        /**
        * 如果实体存在已经定义的视图配置，则读取默认视图配置
        */
        metaViewToGrid(metaEntity,metaView){
            this.initUrls(metaView);
            var _this=this;
            let visibleFields = [];
            let dataMap = _.keyBy(metaEntity.fields, "name");
            let columnsMap = _.keyBy(metaView.config.columns, "name");
            let filters = metaView.config.filters||'';
            let _metaFields = [], _searchFields = [], _advanceSearchFields=[];
            _.each(metaView.config.columns, function (column) {
                let metaField = dataMap[column.name];
                if(metaField){
                    _metaFields.push(metaField);
                    //快捷查询字段
                    if (column.quicksearchable) {
                        _searchFields.push(metaField.name);
                    }
                    //高级查询字段
                    if(column.searchable){
                        _advanceSearchFields.push(metaField.name);
                    }
                }
            });
            //begin 构造工具栏
            let toolbar = {
                btns: ["create","import"],
                advanceSearchFields:_advanceSearchFields
            };
            if (_searchFields.length) {
                toolbar.quicksearch = {
                    fields: _searchFields,
                    placeholder: "根据名称搜索"
                }
            }else{
                let titleField=metaEntity.firstSemanticsField("title");
                if(titleField){
                    toolbar.quicksearch = {
                        fields: titleField.name,
                        placeholder: "根据名称搜索"
                    }
                }
            }
            _this.toolbar=toolbar;
            //end 构造工具栏
            //begin 构造查询条件
            let queryOptions = _this.buildQueryFilters()||{};
            //设置默认过滤条件
            if(queryOptions.filters){
                if(filters){
                    queryOptions.filters=`${filters} and (${queryOptions.filters})`;
                }
            }else{
                queryOptions.filters = filters;
            }
            //设置默认排序
            if (metaView.config.orderby && metaView.config.orderby.length) {
                let _orderby = [];
                _.each(metaView.config.orderby, function (orderby) {
                    _orderby.push(`${dataMap[orderby.name].name} ${orderby.type}`);
                });
                queryOptions.orderby = _orderby.join(",");
            }
            _this.queryOptions=queryOptions;
            //end 构造查询条件
            //begin 构造grid列
            visibleFields = _.filter(_metaFields, function (o) {
                return columnsMap[o.name].visible;
            });
            let columns=[];
            //添加所有可见列
            for (var i = 0; i < visibleFields.length; i++) {
                let metaField = visibleFields[i];
                columns.push({
                    title: metaField.title,
                    key: metaField.name,
                    sortable: columnsMap && columnsMap[metaField.name].sortable ? "custom" : false,
                    align: "center"
                });
            }
            //默认最后一列为操作列
            columns.push({
                title:"具体操作",
                width:220,
                align:"center",
                metaParams:{
                    type:"operation",
                    btns:["edit","view","del"]
                }
            });
            _this.columns = columns;
            //end 构造grid列
            //完成初始化
            _this.preprocessed = true;
        },
        setDefaultQueryOptions(){
            var _this=this;
            //begin 实体没有自定义默认视图数据，检查查询参数构造默认的查询条件
            let queryOptions = _this.buildQueryFilters();
            //检查实体默认的排序字段
            let orderby = _this.buildDefaultOrderby();
            if (queryOptions) {
                if (orderby) {
                    queryOptions.orderby = orderby;
                }
            } else {
                if (orderby) {
                    queryOptions = { orderby: orderby };
                }
            }
            _this.queryOptions = queryOptions;
            //end 
            //完成初始化
            _this.preprocessed = true;
        },
        initGrid() {
            //设置grid的默认父容器
            this.contextParent=this;
            var metaEntity = this.metaEntity;
            var viewShortId=this.$route.query.viewShortId;
            this.viewShortId=viewShortId;
            var _this = this;
            if(!viewShortId){
                _this.setDefaultQueryOptions();
                return;
            }
            metaservice.getViewByShortId({id:viewShortId})
                .then(({ data }) => {
                    //存在自定义视图，由视图构造grid
                    _this.formShortId=data.metaFormShortId;
                    _this.metaViewToGrid(metaEntity,data)
                },(resp)=>{
                    _this.setDefaultQueryOptions();
                });
        }
    }
}