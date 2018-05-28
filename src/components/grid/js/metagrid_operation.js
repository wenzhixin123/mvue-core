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
function operationForCreate(){
  var operation= {
    id:"create",
    title:"添加",
    icon:"plus-round",
    onclick:function(context,$optInst){
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
      if ($optInst.operation.params) {
        let extQuery = {};
        extQuery[Utils.queryKeys.action] = Utils.formActions.create;
        _query = _.extend(_query, $optInst.operation.query || {}, extQuery);
        return parseCurrentRoute(context, $optInst.operation.params, _query);
      }
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
    let formShortId=context.grid.formShortId||'';
    let viewShortId=context.grid.viewShortId||'';
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
function getIdFromContext(context){
  var id=context.selectedId;
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
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(){
  var operation= {
    id:"edit",
    title:"修改",
    icon:"edit",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
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
      if ($optInst.operation.params) {
        let extQuery = {id: id};
        extQuery[Utils.queryKeys.action] = Utils.formActions.edit;
        _query = _.extend(_query, $optInst.operation.query || {}, extQuery);
        return parseCurrentRoute(context, $optInst.operation.params, _query);
      }
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
function operationForView(){
  var operation= {
    id:"view",
    title:"查看",
    icon:"ios-eye-outline",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
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
      if ($optInst.operation.params) {
        let extQuery = {id: id};
        extQuery[Utils.queryKeys.action] = Utils.formActions.view;
        _query = _.extend(_query, $optInst.operation.query || {}, extQuery);
        return parseCurrentRoute(context, $optInst.operation.params, _query);
      }
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
function operationForDel() {
  var operation= {
    id:"del",
    title:"删除",
    icon:"trash-a",
    onclick:function(context,$optInst){
      var id=getIdFromContext(context);
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
 * 批量删除操作
 * @param {*} context
 */
function operationForBatchDelete() {
  var operation= {
    id:"batchDelete",
    title:"批量删除",
    icon:"trash-a",
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
 * 返回到上一步路由
 * @param {*} context 
 */
function goback(){
  var operation= {
    id:"goback",
    title:"返回",
    icon:"",
    onclick:function(context,$optInst){
      router.go(-1);
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
        iview$Modal.error({content:`表单保存操作必须传入表单实例参数`});
        return;
      }
      form.doSaveModel();
    }
  };
  return operation;
}

/**
 * 解析当前路由并跳转到解析后的路由
 * @param {Object} context  上下文
 * @param {Object} params   路由params
 * @param {Object} query    路由query
 */
function parseCurrentRoute(context, params, query) {
  var _self = context.grid || context.form;
  var _route = _.extend({}, _self.$route);
  _route.params = _.extend({}, _route.params, params || {});
  _route.query = _.extend({}, _route.query, query || {});
  _self.$router.push(_route);
}

var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel,
  import:operationForImport,
  exports:operationForExport,
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
    _.forEach(operations,function (opFunc,key) {
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
  fillOperationByMb:function (context,btn) {
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



