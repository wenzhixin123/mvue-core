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
  var path=context.grid.createPath;
  if(_.isEmpty(path) && !_.isEmpty(context.metaEntity)){
    path=context.metaEntity.formPathForCreate();
  }
  var operation= {
    id:"create",
    title:"添加",
    icon:"plus-round",
    onclick:function(params){
      if(_.isEmpty(path)){
        alert("not implement,please set createPath");
        return ;
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:context.metaEntity.name},query:_query});
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
  var routeQuery=context.grid.$route.query;
  let contextParent=context.grid.contextParent;
  let formShortId=contextParent?contextParent.formShortId:'';
  let viewShortId=contextParent?contextParent.viewShortId:'';
  let _query= _.extend({},routeQuery);
  if(formShortId){
    _query.formShortId=formShortId;
  }
  if(viewShortId){
    _query.viewShortId=viewShortId;
  }
  return _query;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit(context){
  //计算id字段
  var idField=null;
  if( !_.isEmpty(context.metaEntity)){
    idField=context.metaEntity.getIdField();
  }
  var operation= {
    id:"edit",
    title:"修改",
    icon:"edit",
    onclick:function(params){
      var clickContext=this;
      if(!idField){
        alert("entity:"+clickContext.metaEntity.name+" not set identity field");
        return;
      }
      var id=params.row[idField.name];
      var path=context.grid.editPath;
      if(_.isEmpty(path) && !_.isEmpty(context.metaEntity)){
        //必须传入数据id构造编辑的路径
        path=context.metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:context.metaEntity.name},query:_query});
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
  //计算id字段
  var idField=null;
  if( !_.isEmpty(context.metaEntity)){
    idField=context.metaEntity.getIdField();
  }
  var operation= {
    id:"view",
    title:"查看",
    icon:"ios-eye-outline",
    onclick:function(params){
      var clickContext=this;
      if(!idField){
        alert("entity:"+clickContext.metaEntity.name+" not set identity field");
        return;
      }
      var id=params.row[idField.name];
      var path=context.grid.viewPath;
      if(_.isEmpty(path) && !_.isEmpty(context.metaEntity)){
        //必须传入数据id构造编辑的路径
        path=context.metaEntity.formPathForEdit(id);
      }else{
        let toPath=pathToRegexp.compile(path);
        path=toPath({id:id});
      }
      let _query=buildQuery(context);
      if(path.indexOf('/')>-1){
        router.push({path:path,query:_query});
      }else{
        router.push({name:path,params:{entityName:context.metaEntity.name},query:_query});
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
  var resource=context.grid.queryResource;
  if(_.isEmpty(resource) &&  !_.isEmpty(context.metaEntity)){
    resource=context.metaEntity.dataResource();
  }
  //计算id字段
  var idField=null;
  if( !_.isEmpty(context.metaEntity)){
    idField=context.metaEntity.getIdField();
  }

  var operation= {
    id:"del",
    title:"删除",
    icon:"trash-a",
    onclick:function(params){
      if(_.isEmpty(resource)){
        alert("can't find delete action path");
        return;
      }
      if(!idField){
        alert("entity:"+clickContext.metaEntity.name+" not set identity field");
        return;
      }
      var clickContext=this;
      var id=params.row[idField.name];
      iview$Modal.confirm({
        title: '提示',
        content: '确定删除吗?',
        onOk: () => {
          //,cascade_delete:true
          resource.delete({id:id}).then(function (re) {
            clickContext.grid.reload();
          });
        }
      });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.del;
  return operation;
}


/**
 * 导出
 * @param {*} context
 */
function operationForExport(context) {
  var resource=context.grid.queryResource;
  if(_.isEmpty(resource) &&  !_.isEmpty(context.metaEntity)){
    resource=context.metaEntity.dataResource();
  }

  var operation= {
    id:"export",
    title:"导出",
    icon:"ios-download-outline",
    onclick:function(params){
      var clickContext=this;
      iview$Modal.confirm({
        title: '提示',
        content: '是否导出当前列表所有数据?',
        onOk: () => {
          var grid=clickContext.grid;
          var queryOptions=grid.buildQueryOptions();
          queryOptions.total=false;
          queryOptions.page_size=grid.totalCount || 500;
          queryOptions.page=1;
          queryOptions.select="*";
          //获取当前项目的swagger地址
          metabase.currentSwagger(grid.$route.params.projectId).then(function(swagger){
            var exportTaskSetting={
              "entityName":grid.metaEntity,
              "swagger":swagger,
              "options":queryOptions
            };
            var metaEntity=metabase.findMetaEntity(grid.metaEntity);
            toolServices.doExport(grid.$route.query,exportTaskSetting).then(function (records) {
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
  var resource=context.grid.queryResource;
  if(_.isEmpty(resource) &&  !_.isEmpty(context.metaEntity)){
    resource=context.metaEntity.dataResource();
  }
  //计算id字段
  var idField=null;
  if( !_.isEmpty(context.metaEntity)){
    idField=context.metaEntity.getIdField();
  }

  var operation= {
    id:"batchDelete",
    title:"批量删除",
    icon:"trash-a",
    onclick:function(params){
      var clickContext=this;
      if(_.isEmpty(resource)){
        alert("can't find delete action path");
        return;
      }
      if(!idField){
        alert("entity:"+clickContext.metaEntity.name+" not set identity field");
        return;
      }
      let checkedRows=clickContext.grid.checked;
      if(!checkedRows||checkedRows.length===0){
        iview$Message.info("未选择任何数据");
        return;
      }
      //检查当前用户对每一行数据是否有删除权限
      let opt={},unpermedItems=[],permedItems=[],unpermedInfo='';
      opt[Utils.dataPermField]=Utils.permValues.del;
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
              clickContext.grid.reload();
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
function operationForImport(context){
  var grid=context.grid;
  var operation= {
    id:"import",
    title:"导入",
    icon:"ios-upload-outline",
    render:(h, ctx) => {//toolbar_btn_render.js会调用这个render函数生成toolbar的按钮和功能
        return h('meta-grid-import-data',{
          props:{
            toolbarBtn: ctx.toolbarBtn,
            toolbarType: ctx.toolbarType,
            grid: grid
          }
        });
    }
  };
  operation[Utils.dataPermField]=Utils.permValues.create;
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



