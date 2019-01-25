/**
 *  列表的修改操作
 */
import contextHelper from "../../../../libs/context";
import  gridUtils from "../utils";

var operation= {
    name: "edit",
    title: "修改",
    icon: "md-create",
    to:null,
    operationType:"common",
    btnType:"primary",
    security:["edit"],
    entitySecurity:true,
    disabled:function (ctx) {//兼容放在grid头部的button区的控制：仅当选择一条数据时可用
        return !(ctx.selectedItems && ctx.selectedItems.length ==1);
    },
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
    if(context.grid&&context.grid.topEntity){
        let topEntityRow=`${context.grid.metaEntity.name}/${id}`;
        _query= _.extend(_query,{'x_top_entity_row':topEntityRow});
    }
    var _params={entityName:metaEntity.name};
    var defaultRouter={
        params:_.assign(_params,{id:id}),
        query:_query
    }
    var router=null;
    if($optInst&&$optInst.operation){
        router=gridUtils.buildRouteToFromOp($optInst.operation);
    }
    if(router==null){
        router=gridUtils.buildRouteToFromEntity(metaEntity,id,context.grid && context.grid.useRelativePath);
    }
    router=_.merge(defaultRouter,router);
    gridUtils.goto(router);
}

export default  operation





