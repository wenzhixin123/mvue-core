/**
 * 操作注册
 */
import  manager from "../../../libs/operation/operations"

//模板操作
import  routeTo from "./template/routeTo";
manager.register(routeTo);

//通用操作
import goBackOp from "./goback";
manager.register(goBackOp);

//列表操作
import  batchDelete from "./grid/batchDelete";
manager.register(batchDelete);

import createOp from "./grid/create";
manager.register(createOp);

import del from "./grid/del";
manager.register(del);

import edit from "./grid/edit";
manager.register(edit);

import exportOp from "./grid/export";
manager.register(exportOp);

import importOp from "./grid/import";
manager.register(importOp);

import view from "./grid/view";
manager.register(view);

import openEdit from "./grid/open-edit";
manager.register(openEdit);
import cancelEdit from "./grid/cancel-edit";
manager.register(cancelEdit);
import saveRow from "./grid/save-row";
manager.register(saveRow);

// 表单操作
import cancel from "./form/cancel";
manager.register(cancel);

import save from "./form/save";
manager.register(save);

manager.registerByTpl({
    name:"gotoEdit",
    title: "修改",
    icon: "md-create",
    btnType:"primary",
    security:["edit"],
    entitySecurity:true,
    url:"./view",
    type:"routeTo"
});



export default manager;


