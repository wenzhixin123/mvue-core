/**
 * 提供grid内置的操作
 */
import metabase from '../../../libs/metadata/metabase';
import ExportCsv from './export_csv';
import contextHelper from "../../../libs/context";
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
      _query[context.grid.relation.refField]=context.grid.refEntityId;
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
/**
 * 创建操作，跳转到新建表单页
 * @param context
 */
function operationForCreate(){
  var operation= {
    id:"create",
    title:"添加",
    icon:"plus",
    onclick:function(context,$optInst){
      var path=null;
      let _query=buildQuery(context);
      var to=$optInst&&$optInst.operation.to;
      if(to){
        if(_.isString(to)){
          path=to;
        }else{//router 对象参数
          to.query=_.extend(_query,to.query);
          contextHelper.getRouter().push(to);
          return;
        }
      }
      var metaEntity=context.metaEntity;
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        path=context.metaEntity.formPathForCreate();
      }
      if(_.isEmpty(path)){
        alert("not implement,please set createPath");
        return ;
      }
      if(path.indexOf('/')>-1){
        contextHelper.getRouter().push({path:path,query:_query});
      }else{
        contextHelper.getRouter().push({name:path,params:{entityName:metaEntity.name},query:_query});
      }
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
  return operation;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(){
  var operation= {
    id:"edit",
    title:"修改",
    icon:"md-create",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        contextHelper.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var path=null;
      let _query=buildQuery(context);
      var to=$optInst&&$optInst.operation.to;
      if(to){
        if(_.isString(to)){
          path=to;
        }else{//router 对象参数
          to.query=_.extend(_query,to.query);
          if(to.path){
            let toPath=pathToRegexp.compile(to.path);
            to.path=toPath({id:id});
          }
          contextHelper.getRouter().push(to);
          return;
        }
      }
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        //必须传入数据id构造编辑的路径
        path=metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      if(path.indexOf('/')>-1){
          contextHelper.getRouter().push({path:path,query:_query});
      }else{
          contextHelper.getRouter().push({name:path,params:{entityName:metaEntity.name},query:_query});
      }
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.edit;;
  return operation;
}
/**
 * 查看操作，跳转到查看页面
 * @param context
 */
function operationForView(){
  var operation= {
    id:"view",
    title:"查看",
    icon:"ios-eye-outline",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
        contextHelper.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var path=null;
      let _query=buildQuery(context);
      var to=$optInst&&$optInst.operation.to;
      if(to){
        if(_.isString(to)){
          path=to;
        }else{//router 对象参数
          to.query=_.extend(_query,to.query);
          if(to.path){
            let toPath=pathToRegexp.compile(to.path);
            to.path=toPath({id:id});
          }
          contextHelper.getRouter().push(to);
          return;
        }
      }
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        //必须传入数据id构造编辑的路径
        path=metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      if(path.indexOf('/')>-1){
          contextHelper.getRouter().push({path:path,query:_query});
      }else{
          contextHelper.getRouter().push({name:path,params:{entityName:metaEntity.name},query:_query});
      }
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.view;
  return operation;
}
/**
 * 删除操作
 * @param {*} context
 */
function operationForDel() {
  var operation= {
    id:"del",
    title:"删除",
    icon:"ios-trash",
      type:"warning",
      disabled:function (ctx) {
          return !(ctx.selectedItems && ctx.selectedItems.length === 1);
      },
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
      if(!id){
          contextHelper.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var resource=context.grid&&context.grid.queryResource;
      if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
      }
      if(_.isEmpty(resource)){
        contextHelper.error({content:`实体删除地址未设置`});
        return;
      }
      contextHelper.confirm({
        title: '提示',
        content: '确定删除吗?',
        onOk: () => {
          //,cascade_delete:true
          resource.delete({id:id}).then(function (re) {
            //如果是grid列表的操作，刷新列表
            context.grid&&context.grid.reload();
            //如果是表单的删除操作，执行表单的删除后回调
            context.form&&context.form.onDeleted();
          });
        }
      });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.del;
  return operation;
}

/**
 * 批量删除操作
 * @param {*} context
 */
function operationForBatchDelete() {
  var operation= {
    id:"batchDelete",
    title:"删除",
    icon:"ios-trash",
      disabled:function (ctx) {
          return !(ctx.selectedItems && ctx.selectedItems.length > 0);
      },
    onclick:function(context,$optInst){
      var metaEntity=context.metaEntity;
      //计算id字段
      var idField=null;
      if( !_.isEmpty(metaEntity)){
        idField=metaEntity.getIdField();
      }
      var resource=context.grid&&context.grid.queryResource;
      if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
      }
      //检查当前用户对每一行数据是否有删除权限
      let opt={},unpermedItems=[],permedItems=[],unpermedInfo='';
      opt[Utils.dataPermField]=Utils.permValues.del;
      var checkedRows=context.selectedItems;
      if(_.isEmpty(checkedRows)){
        contextHelper.error({content:`必须传入选中的所有行数据`});
        return;
      }
      _.each(checkedRows,function(item){
        let has=Utils.hasDataPerm(item,opt); 
        if(!has){
          unpermedItems.push(item);
        }else{
          permedItems.push(item);
        }
      });
      if(!_.isEmpty(unpermedItems)){
        if(unpermedItems.length===checkedRows.length){
          contextHelper.warning({
            title: '提示',
            content:'您对选中的数据没有删除权限'
          });
          return;
        }else{
          unpermedInfo=`您选中了${checkedRows.length}条数据，有${unpermedItems.length}条没有删除权限，继续删除剩下的${checkedRows.length-unpermedItems.length}条吗`;
        }
      }
      contextHelper.confirm({
        title: '提示',
        content: unpermedInfo||'确定删除吗?',
        onOk: () => {
          _.each(permedItems,function(row){
            let id=row[idField.name];
            //,cascade_delete:true
            resource.delete({id:id}).then(function (re) {
              context.grid&&context.grid.reload();
            });
          });
        }
      });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.del;
  return operation;
}

/**
 * 数据导入操作
 */
function operationForImport(){
  var operation= {
    id:"import",
    title:"导入",
    icon:"ios-upload-outline",
    renderComponent:"meta-grid-import-data"
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
  return operation;
}
/**
 * 导出
 * @param {*} context
 */
function operationForExport() {
  var operation= {
    id:"export",
    title:"导出",
    icon:"ios-download-outline",
    onclick:function(context,$optInst){
      var resource=context.grid&&context.grid.queryResource;
      var metaEntity=context.metaEntity;
      var grid=context.grid;
      if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
      }
      if(_.isEmpty(resource)){
        contextHelper.error({content:`实体查询地址未设置`});
        return;
      }
      contextHelper.confirm({
        title: '提示',
        content: '是否导出当前列表所有数据?',
        onOk: () => {
          var queryOptions={page_size:500};
          if(grid){
            queryOptions=grid.buildQueryOptions();
            queryOptions.page_size=grid.totalCount || queryOptions.page_size;
          }
          queryOptions.total=false;
          queryOptions.page=1;
          queryOptions.select="*";
          //获取当前项目的swagger地址
          metabase.currentSwagger(metaEntity.projectId).then(function(swagger){
            var exportTaskSetting={
              "entityName":metaEntity.name,
              "swagger":swagger,
              "options":queryOptions
            };
            var metaEntity=metabase.findMetaEntity(metaEntity.name);
            var query={};
            if(grid){
              query=grid.$route.query;
            }
            toolServices().doExport(query,exportTaskSetting).then(function (records) {
              ExportCsv.download(metaEntity.title+".csv", records.body.join("\r\n"));
            });
          });
        }
      });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.view;
  return operation;
}

/**
 * 返回到上一步路由
 * @param {*} context 
 */
function goback(){
  var operation= {
    id:"goback",
    title:"返回",
    icon:"",
    onclick:function(context,$optInst){
        contextHelper.getRouter().go(-1);
    }
  };
  return operation;
}

/**
 * 保存数据（表单保存）
 * @param {*} context 
 */
function save(){
  var operation= {
    id:"save",
    title:"保存",
    icon:"",
    onclick:function(context,$optInst){
      var form=context.form;
      if(_.isEmpty(form)){
        contextHelper.error({content:`表单保存操作必须传入表单实例参数`});
        return;
      }
      form.doSaveModel();
    }
  };
  return operation;
}

var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
  import:operationForImport,
  export:operationForExport,
  batchDelete:operationForBatchDelete,
  goback:goback,
  save:save
}

export default {
  /**
   * 根据操作中，创建一个默认的操作
   * @param context
   * @param operationName
   */
  createOperation:function (operationName) {
    if(_.isEmpty(operationName)){
      return null;
    }
    var func=null;
    _.forIn(operations,function (opFunc,key) {
      if(key.toLowerCase()==operationName.toLowerCase()){
        func=opFunc;
        return false;
      }
    });
    if(func!=null){
      return func();
    }
    return null;
  },
  fillOperationByMb:function (btn) {
      var oldBtn = {};
      var name = "";
      if (_.isString(btn)) {
        name = btn;
      } else {
        name = btn.name;
        oldBtn = btn;
      }
      var mergedBtn = this.createOperation(name);
      if (mergedBtn == null) {
        return oldBtn;
      } else {
        mergedBtn = _.extend(mergedBtn, oldBtn);
        return mergedBtn;
      }
  }
}



