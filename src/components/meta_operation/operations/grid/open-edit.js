/**
 *  列表的开启修改操作
 */
import gridUtils from "../utils";
import contextHelper from "../../../../libs/context";

var operation= {
    name: "openEdit",
    title: "编辑行",
    icon: "md-create",
    operationType:"common",
    btnType:"primary",
    show:function(context,item){
        if(!context.grid.editRow&&(context.grid.editRow!==0)){
            return true;
        }
        var metaEntity=context.grid.metaEntity;
        var idFieldName=metaEntity.getIdField().name;
        if(item[idFieldName]===context.grid.editRow){
            return false;
        }
        return true;
    },
    security:["edit"],
    entitySecurity:true,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};


function impl(context,$optInst){
    var id=gridUtils.getIdFromContext(context);
    if(!id){
        contextHelper.error({content:`当前数据id未设置`});
        return;
    }
    if(context.grid){
        context.grid.editRow=id;
        context.grid.$emit("on-row-edit",id,context.selectedItem);
    }
}

export default  operation





