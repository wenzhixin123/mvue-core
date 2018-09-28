import contextHelper from "../../../libs/context";
import propParser from "../../../services/tool/prop_parser";
var pathToRegexp = require('path-to-regexp');

/**
 * 将自定义视图和表单的shortId附加到query参数后
 */
function buildQuery(context){
    let _query={};
    if(context.grid){
        var routeQuery=context.grid.$route.query;
        let formShortId=context.grid.formShortId||'';
        let viewShortId=context.grid.viewShortId||'';
        _query= _.extend({},routeQuery);
        if(formShortId){
            _query.formShortId=formShortId;
        }
        if(viewShortId){
            _query.viewShortId=viewShortId;
        }
        //关系字段过滤条件附加到url
        if(context.grid.refEntityId){
            _query[context.grid.relation.refField]=context.grid.refEntityId();
        }
    }
    return _query;
}

function getIdFromContext(context){
    var id=context.selectedId ;
    var metaEntity=context.metaEntity;
    if(!id){
        var selectedItem=context.selectedItem;
        if(selectedItem){
            //计算id字段
            var idField=null;
            if( !_.isEmpty(metaEntity)){
                idField=metaEntity.getIdField();
            }
            id=selectedItem[idField];
        }
    }
    return id;
}

function buildRouteToFromOp(op) {
    var router=op.to;
    if(!_.isNil(router) && _.isString(router)) {
        router = {
            path: router, query: {}, params: {}
        };
    }
    if(!_.isNil(router)){
        return router;
    }
    var pageId = op.page && op.page.id;
    if (!_.isNil(pageId)) {
        router={
            name: "defaultPageIndex",
            params:{pageId: pageId},
            query:_.assign({},op.queryParams)
        };
    }
    return router;
}

function buildDeleteHandler(opInst,grid,metaEntity) {
    var func=null;
    if(opInst && _.isFunction(opInst.handler)){
        func=opInst.handler
        return func;
    }
    if(grid && grid.queryResource &&  _.isFunction(grid.queryResource.delete)){
        func=grid.queryResource.delete;
        return func;
    }
    var  resource=metaEntity.dataResource();
    func=resource.delete;
    return func;
}

function goto(router) {
    if(_.has(router,"path")){
        var path= pathToRegexp.compile(router.path)(router.params);
        router.path=path;
    }
    contextHelper.getRouter().push(router);
}

function expandOperation(operation,ctx){
    var params={};
    _.forIn(operation.props,function(propValue,propKey){
        if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
            var parsedValue=propParser.parse(propValue,ctx);
            params[propKey]=parsedValue;
        }
    });
    return _.extend(operation,params);
}

export default {
    operationDisplayField:"display",
    goto,
    buildQuery,
    getIdFromContext,
    buildRouteToFromOp,
    buildDeleteHandler,
    expandOperation
}