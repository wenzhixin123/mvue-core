import metaGrid from "../grid/js/metagrid";

function initUrls(gridInst,metaView){
    var settings=metaView.settings;
    if(settings&&settings.viewUrl){
        gridInst.viewPath=settings.viewUrl;
    }
    if(settings&&settings.editUrl){
        gridInst.editPath=settings.editUrl;
    }
    if(settings&&settings.createUrl){
        gridInst.createPath=settings.createUrl;
    }
}
function initQuickSearch(gridInst,metaView){
    var filteredCols=_.filter(metaView.config.columns,col=>{
        return col.quicksearchable;
    });
    var _fields=[];
    _.each(filteredCols,col=>{
        _fields.push(col.name);
    });
    if (_fields.length) {
        gridInst.innerToolbar.quicksearch = gridInst.innerToolbar.quicksearch||{};
        gridInst.innerToolbar.quicksearch.fields= _fields
    }
}
function initAdvanceSearch(gridInst,metaView){
    var filteredCols=_.filter(metaView.config.columns,col=>{
        return col.searchable;
    });
    var _fields=[];
    _.each(filteredCols,col=>{
        _fields.push(col.name);
    });
    gridInst.innerToolbar.advanceSearchFields=_fields;
}
function initOrderBy(gridInst,metaView){
    //设置默认排序
    if (metaView.config.orderby && metaView.config.orderby.length) {
        //TODO 这里只支持一个排序，所以配置那边应该约束
        let ob=metaView.config.orderby[0];
        gridInst.innerSort={key:ob.name,order:ob.type};
    }
}
function initColumns(gridInst,metaView){
    var metaEntity=gridInst.metaEntity;
    let visibleFields = [];
    let dataMap = metaEntity.fields;
    let columnsMap = _.keyBy(metaView.config.columns, function (item) {
        return item["name"];
    });
    let _metaFields = [];
    _.each(metaView.config.columns, function (column) {
        let metaField = dataMap[column.name];
        if(metaField){
            _metaFields.push(metaField);
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
    visibleFields = _.filter(_metaFields, function (o) {
        return columnsMap[o.name].visible;
    });
    let columns=[];
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
    gridInst.innerColumns = columns;
    metaGrid.initColumns(gridInst);
}
export default{
    initUrls,
    initQuickSearch,
    initAdvanceSearch,
    initOrderBy,
    initColumns
}