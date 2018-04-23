/**
 * 提供grid内置的操作
 */
import metabase from '../../../libs/metadata/metabase';
import ExportCsv from './export_csv';
import toolServices from '../../../services/tool/tool_service';
var pathToRegexp = require('path-to-regexp');

/**
 * 创建操作，跳转到新建表单页
 * @param context
 */
function operationForCreate(context){
  var operation= {
    id:"create",
    title:"添加",
    icon:"plus-round",
    onclick:function(){
      var path=context.grid&&context.grid.createPath;
      var metaEntity=context.metaEntity;
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        path=context.metaEntity.formPathForCreate();
      }
      if(_.isEmpty(path)){
        alert("not implement,please set createPath");
        return ;
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:metaEntity.name},query:_query});
      }
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
  return operation;
}
/**
 * 将自定义视图和表单的shortId附加到query参数后
 */
function buildQuery(context){
  let _query={};
  if(context.grid){
    var routeQuery=context.grid.$route.query;
    let contextParent=context.grid.contextParent;
    let formShortId=contextParent?contextParent.formShortId:'';
    let viewShortId=contextParent?contextParent.viewShortId:'';
    _query= _.extend({},routeQuery);
    if(formShortId){
      _query.formShortId=formShortId;
    }
    if(viewShortId){
      _query.viewShortId=viewShortId;
    }
  }
  return _query;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(context){
  var operation= {
    id:"edit",
    title:"修改",
    icon:"edit",
    onclick:function(){
      var id=context.selectedId;
      if(!id){
        iview$Modal.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var path=context.grid&&context.grid.editPath;
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        //必须传入数据id构造编辑的路径
        path=metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:metaEntity.name},query:_query});
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
function operationForView(context){
  var operation= {
    id:"view",
    title:"查看",
    icon:"ios-eye-outline",
    onclick:function(params){
      var id=context.selectedId;
      if(!id){
        iview$Modal.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var path=context.grid&&context.grid.viewPath;
      if(_.isEmpty(path) && !_.isEmpty(metaEntity)){
        //必须传入数据id构造编辑的路径
        path=metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:metaEntity.name},query:_query});
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
function operationForDel(context) {
  var operation= {
    id:"del",
    title:"删除",
    icon:"trash-a",
    onclick:function(params){
      var id=context.selectedId;
      if(!id){
        iview$Modal.error({content:`当前数据id未设置`});
        return;
      }
      var metaEntity=context.metaEntity;
      var resource=context.grid&&context.grid.queryResource;
      if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
      }
      if(_.isEmpty(resource)){
        iview$Modal.error({content:`实体删除地址未设置`});
        return;
      }
      iview$Modal.confirm({
        title: '提示',
        content: '确定删除吗?',
        onOk: () => {
          //,cascade_delete:true
          resource.delete({id:id}).then(function (re) {
            context.grid&&context.grid.reload();
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
function operationForImport(context){
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
function operationForExport(context) {
  var operation= {
    id:"export",
    title:"导出",
    icon:"ios-download-outline",
    onclick:function(){
      var resource=context.grid&&context.grid.queryResource;
      var metaEntity=context.metaEntity;
      var grid=context.grid;
      if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
      }
      if(_.isEmpty(resource)){
        iview$Modal.error({content:`实体查询地址未设置`});
        return;
      }
      iview$Modal.confirm({
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
            toolServices.doExport(query,exportTaskSetting).then(function (records) {
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
 * 批量删除操作
 * @param {*} context
 */
function operationForBatchDelete(context) {
  var operation= {
    id:"batchDelete",
    title:"批量删除",
    icon:"trash-a",
    onclick:function(params){
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
        iview$Modal.error({content:`必须传入选中的所有行数据`});
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
          iview$Modal.warning({
            title: '提示',
            content:'您对选中的数据没有删除权限'
          });
          return;
        }else{
          unpermedInfo=`您选中了${checkedRows.length}条数据，有${unpermedItems.length}条没有删除权限，继续删除剩下的${checkedRows.length-unpermedItems.length}条吗`;
        }
      }
      iview$Modal.confirm({
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


var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
  import:operationForImport,
  exports:operationForExport,
  batchDelete:operationForBatchDelete
}

export default {
  /**
   * 根据操作中，创建一个默认的操作
   * @param context
   * @param operationName
   */
  createOperation:function (context,operationName) {
    if(_.isEmpty(operationName)){
      return null;
    }
    var func=null;
    _.forEach(operations,function (opFunc,key) {
      if(key.toLowerCase()==operationName.toLowerCase()){
        func=opFunc;
        return false;
      }
    });
    if(func!=null){
      return func(context);
    }
    return null;
  },
  fillOperationByMb:function (context,btn) {
      var oldBtn = {};
      var name = "";
      if (_.isString(btn)) {
        name = btn;
      } else {
        name = btn.name;
        oldBtn = btn;
      }
      var mergedBtn = this.createOperation(context, name);
      if (mergedBtn == null) {
        return oldBtn;
      } else {
        mergedBtn = _.extend(mergedBtn, oldBtn);
        return mergedBtn;
      }
  }
}



