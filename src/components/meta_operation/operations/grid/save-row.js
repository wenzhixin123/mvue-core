/**
 *  列表的开启修改操作
 */
import gridUtils from "../utils";
import contextHelper from "../../../../libs/context";

var operation= {
    name: "saveRow",
    title: "保存",
    icon:"ios-document-outline",
    operationType:"common",
    btnType:"primary",
    show:function(context,item){
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
    security:["edit"],
    entitySecurity:true,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};


function impl(context,$optInst){
    if(context.grid){
        if(!context.grid.editRow||(context.grid.editRow===0)){
            return;
        }
        context.grid.$emit("on-row-save",context);
    }
}

export default  operation





