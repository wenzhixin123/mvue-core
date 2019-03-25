/**
 *  跳转到
 */
import  gridUtils from "../utils";
import contextHelper from "../../../../libs/context";

var operation= {
    name: "routeTo",
    title: "跳转",
    icon: "md-link",
    to:null,
    operationType:"common",
    btnType:"primary",
    security:null,
    selectedItem:null,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
//operation[contextHelper.getMvueToolkit().utils.dataPermField]=contextHelper.getMvueToolkit().utils.permValues.create;

function impl(context,$optInst){
    var routeCtx={};
    var metaEntity=context.metaEntity;
    if(metaEntity){
        routeCtx=_.assign(routeCtx,{
            entityName:metaEntity.name
        });
    }
    var _query=gridUtils.buildQuery(context);
    if(_query){
        routeCtx=_.assign(routeCtx,_query);
    }
    var id=gridUtils.getIdFromContext(context);
    if(id){
        routeCtx=_.assign(routeCtx,{
            id:id
        });
    }
    var op=$optInst.operation;
    if(op.to==null && op.url){
        op.to=op.url;
    }
    var router=gridUtils.buildRouteToFromOp(op);
    gridUtils.goto(router,routeCtx);
}
export default  operation





