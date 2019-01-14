/**
 *  列表的创建操作
 */
import  gridUtils from "../utils";

var operation= {
    name: "create",
    title: "添加",
    icon: "md-add",
    to:null,
    operationType:"common",
    btnType:"primary",
    security:["create"],
    entitySecurity:true,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
//operation[contextHelper.getMvueToolkit().utils.dataPermField]=contextHelper.getMvueToolkit().utils.permValues.create;

function impl(context,$optInst){
    var metaEntity=context.metaEntity;
    var _query=gridUtils.buildQuery(context);
    var _params={entityName:metaEntity.name};
    var defaultRouter={
        query:_query,
        params:_params
    }

    var router=null;
    if($optInst&&$optInst.operation){
        router=gridUtils.buildRouteToFromOp($optInst.operation);
    }
    if(router==null){
        router=buildRoutToFromEntity(metaEntity);
    }
    router=_.merge(defaultRouter,router);
    gridUtils.goto(router);
}

function buildRoutToFromEntity(metaEntity) {
    var path=metaEntity.formPathForCreate();
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





