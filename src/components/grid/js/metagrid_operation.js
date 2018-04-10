/**
 * 提供grid内置的操作
 */
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
    title:"新建",
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
            resource.delete({id:id,cascade_delete:true}).then(function (re) {
            clickContext.grid.reload();
          });
        }
      });
    }
  };
  return operation;
}


var operations={
  create:operationForCreate,
  edit:operationForEdit,
  view:operationForView,
  del:operationForDel
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
      if(key.toLowerCase()==operationName){
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



