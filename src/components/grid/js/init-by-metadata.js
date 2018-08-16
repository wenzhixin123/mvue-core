import metaGrid from "./metagrid";
function buildQueryFilters(gridInst) {
    var metaEntity=gridInst.metaEntity;
    var query = gridInst.$route.query;
    //如果有查询条件，并且查询key是实体的字段，则加入到默认查询条件中
    let queryOptions = {};
    if (query) {
        let _queryOptions = {};
        _.forIn(query, function (value, key) {
            if (metaEntity.findField(key)) {
                _queryOptions[key]=value;
            }
        });
        queryOptions=_queryOptions;
    }
    return queryOptions;
}
function buildDefaultOrderby(gridInst) {
    var metaEntity=gridInst.metaEntity;
    let updatedAtField = metaEntity.firstSemanticsField("updatedAt");
    let orderby = null;
    if (updatedAtField) {//实体有更新时间字段，并且queryOptions没写，则按照更新时间降序排列
        orderby = `${updatedAtField.name} desc`;
    }
    return orderby;
}
function initGrid(gridInst){
    //检查查询参数构造默认的查询条件
    let queryOptions = buildQueryFilters(gridInst);
    //检查实体默认的排序字段
    let orderby = buildDefaultOrderby(gridInst);
    if (queryOptions) {
        if (orderby) {
            queryOptions.orderby = orderby;
        }
    } else {
        if (orderby) {
            queryOptions = { orderby: orderby };
        }
    }
    gridInst.innerQueryOptions = _.extend(queryOptions,gridInst.innerQueryOptions);
    metaGrid.initGridByMetabase(gridInst);
    //完成初始化
    gridInst.preprocessed = true;
}
export default {initGrid,buildQueryFilters};