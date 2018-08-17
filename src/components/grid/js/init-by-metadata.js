import metaGrid from "./metagrid";
function buildFiltersFromQuery(gridInst) {
    var metaEntity=gridInst.metaEntity;
    var query = gridInst.$route.query;
    //如果有查询条件，并且查询key是实体的字段，则加入到默认查询条件中
    let queryFilters = {};
    if (query) {
        _.forIn(query, function (value, key) {
            if (metaEntity.findField(key)) {
                queryFilters[key]={
                    op:'eq',
                    value:value
                };
            }
        });
    }
    return queryFilters;
}
function buildDefaultOrderby(gridInst) {
    var metaEntity=gridInst.metaEntity;
    let updatedAtField = metaEntity.firstSemanticsField("updatedAt");
    let orderby = null;
    if (updatedAtField) {//实体有更新时间字段，则按照更新时间降序排列
        orderby ={
            key:updatedAtField.name,order:'desc'
        };
    }
    return orderby;
}
function initGrid(gridInst){
    metaGrid.initGridByMetabase(gridInst);
}
export default {initGrid,buildFiltersFromQuery,buildDefaultOrderby};