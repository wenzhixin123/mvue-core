/**
 *  列表的开启修改操作
 */
import gridUtils from "../utils";
import contextHelper from "../../../../libs/context";

var operation= {
    name: "cancelEdit",
    title: "取消",
    icon:"md-return-left",
    operationType:"common",
    btnType:"primary",
    toggle:function(context,item){
        if(!context.grid.editRow&&(context.grid.editRow!==0)){
            return false;
        }
        var metaEntity=context.grid.metaEntity;
        var idFieldName=metaEntity.getIdField().name;
        if(item[idFieldName]===context.grid.editRow){
            return true;
        }
        return false;
    },
    security:["update"],
    entitySecurity:true,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};


function impl(context,$optInst){
    context.grid.$emit("on-row-cancel-edit",context);
}

export default  operation





