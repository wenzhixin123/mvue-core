import metabase from '../../../libs/metadata/metabase';
import metaservice from '../../../services/meta/metaservice';
import metaGrid from "./metagrid";

export default {
    methods: {
        buildQueryFilters() {
            if(!this.metaEntity){
                return null;
            }
            var query = this.$route.query;
            var metaEntity = this.metaEntity;
            //如果有查询条件，并且查询key是实体的字段，则加入到默认查询条件中
            let queryOptions = {};
            if (query) {
                let _queryOptions = {};
                _.each(query, function (value, key) {
                    if (metaEntity.findField(key)) {
                        _queryOptions[key]=value;
                    }
                });
                queryOptions=_queryOptions;
            }
            return queryOptions;
        },
        buildDefaultOrderby() {
            if(!this.metaEntity){
                return null;
            }
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
                    //列宽度
                    if(_.isInteger(column.width)){
                        metaField.width=column.width;
                    }
                    //列固定
                    if(column.fixed){
                        metaField.fixed=column.fixed;
                    }
                    //对齐方式
                    if(column.align){
                        metaField.align=column.align;
                    }
                }
            });
            //在外部设置好操作后，查询字段还需要附加上去
            if(this.innerToolbar){
                this.innerToolbar.advanceSearchFields=_advanceSearchFields;
                let quickSearchPlacehoder="请输入关键字搜索";
                if (_searchFields.length) {
                    this.innerToolbar.quicksearch = {
                        fields: _searchFields,
                        placeholder: quickSearchPlacehoder
                    }
                }else{
                    let titleField=metaEntity.firstSemanticsField("title");
                    if(titleField){
                        this.innerToolbar.quicksearch = {
                            fields: [titleField.name],
                            placeholder: quickSearchPlacehoder
                        }
                    }
                }
            }
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
            _this.innerQueryOptions=queryOptions;
            //end 构造查询条件
            //begin 构造grid列
            visibleFields = _.filter(_metaFields, function (o) {
                return columnsMap[o.name].visible;
            });
            let columns=[];
            if(toolbar.batchBtns&&toolbar.batchBtns.length>0){
                columns=[{type: 'selection',width:58,align:"center"}];
            }
            //添加所有可见列
            for (var i = 0; i < visibleFields.length; i++) {
                let metaField = visibleFields[i];
                let __col={
                    title: metaField.title,
                    key: metaField.name,
                    sortable: columnsMap && columnsMap[metaField.name].sortable ? "custom" : false,
                    align: metaField.align||"center",
                };
                if(metaField.width){
                    __col.width=metaField.width;
                }
                if(metaField.fixed){
                    __col.fixed=metaField.fixed;
                }
                columns.push(__col);
            }
            //如果操作列不和标题列合并，默认最后一列为操作列
            if(!this.operationsWithTitleColumn){
                columns.push({
                    title:"具体操作",
                    width:220,
                    align:"center",
                    metaParams:{
                        type:"operation"
                    }
                });
            }
            _this.innerColumns = columns;
            //end 构造grid列
            metaGrid.initGridByMetabase(this);
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
            _this.innerQueryOptions = _.extend(queryOptions,_this.innerQueryOptions);
            //end
            metaGrid.initGridByMetabase(this);
            //完成初始化
            _this.preprocessed = true;
        },
        initGridByViewId() {//根据viewId获取视图配置并初始化grid的一些属性
            var viewShortId;
            if(this.viewId){
                viewShortId = this.viewId;
            }else{
                viewShortId = this.$route.query.viewShortId;
            }
            this.viewShortId=viewShortId;
            var _this = this;
            if(!viewShortId){
                _this.setDefaultQueryOptions();
                return;
            }
            metaservice.getViewByShortId({id: viewShortId})
                .then(({ data }) => {
                    //需要通过viewId--获取配置,不需要预定义
                    _this.metaEntity = metabase.findMetaEntity(data.metaEntityName);
                    _this.entityName = data.metaEntityName;
                    //存在自定义视图，由视图构造grid
                    _this.formShortId = data.metaFormShortId
                    if (data.config && data.config.columns) {
                        _this.metaViewToGrid(_this.metaEntity, data);
                    } else {//虽然存在视图，但是没有任何配置，依然用默认
                        _this.setDefaultQueryOptions();
                    }
                }, (resp)=> {
                    _this.setDefaultQueryOptions();
                });
        }
    }
}
