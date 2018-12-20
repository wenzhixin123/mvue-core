/**
 * 操作注册
 */
import  manager from "../../../libs/operation/operations"
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

// 表单操作
import cancel from "./form/cancel";
manager.register(cancel);

import save from "./form/save";
manager.register(save);

export default manager;

