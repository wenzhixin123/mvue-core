/**
 *  列表的修改操作
 */
import contextHelper from "../../../../libs/context";
import  gridUtils from "../utils";
var pathToRegexp = require('path-to-regexp');

var operation= {
    name: "edit",
    title: "修改",
    icon: "md-create",
    to:null,
    operationType:"common",
    type:"primary",
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
//operation[contextHelper.getMvueToolkit().utils.dataPermField]=contextHelper.getMvueToolkit().utils.permValues.create;


function impl(context,$optInst){
    var id=gridUtils.getIdFromContext(context);
    if(!id){
        contextHelper.error({content:`当前数据id未设置`});
        return;
    }
    var metaEntity=context.metaEntity;
    var _query=gridUtils.buildQuery(context);
    var _params={entityName:metaEntity.name};
    var defaultRouter={
        query:_.assign(_query,{id:id}),
        params:_params
    }
    debugger;
    var router=null;
    if($optInst&&$optInst.operation){
        router=gridUtils.buildRouteToFromOp($optInst.operation);
    }
    if(router==null){
        router=buildRoutToFromEntity(metaEntity,id);
    }
    router=_.merge(defaultRouter,router);
    router.query=_.assign(router.query,{"dataId":id});
    gridUtils.goto(router);
}

function buildRoutToFromEntity(metaEntity,id) {
    var path=metaEntity.formPathForEdit(id);
    if(_.isEmpty(path)){
        alert("not implement,please set createPath");
        return ;
    }
    var router=null;
    if(path.indexOf('/')>-1){
        router={path:path,query:{}};
    }else{
        router={name:path,params:{},query:{}};
    }
    return router;
}

export default  operation





