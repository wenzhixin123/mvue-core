/**
 * 提供grid内置的操作
 */
import metabase from '../../../libs/metadata/metabase';
import ExportCsv from '../../grid/js/export_csv';
import toolServices from '../../../services/tool/tool_service';
var pathToRegexp = require('path-to-regexp');
/**
 * 获取当前选中的行id
 * @param {object} context 
 */
function getIdFromContext(context) {
  var id = context.selectedId;
  var metaEntity = context.metaEntity;
  if (!id) {
    var selectedItem = context.selectedItem;
    if (selectedItem) {
      //计算id字段
      var idField = null;
      if (!_.isEmpty(metaEntity)) {
        idField = metaEntity.getIdField();
      }
      id = selectedItem[idField];
    }
  }
  return id;
}
/**
 * 跳转到pageId指定的页面
 * @param {string} pageId 页面id
 * @param {object} _query 页面url query参数
 */
function toPage(pageId, _query) {
  var _params = { pageId: pageId };
  router.push({ name: "defaultPageIndex", query: _query, params: _params });
}
/**
 * 创建操作，跳转到新建表单页
 * @param context
 */
function operationForCreate() {
  var operation = {
    onclick: function (context, $optInst) {
      var operation = $optInst.operation;
      let pageId = operation.page && operation.page.id;
      if (!pageId) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `跳转页面未设置` });
        return;
      }
      var _query = _.extend({}, operation.queryParams);
      toPage(pageId, _query);
      $optInst.mustStopRepeatedClick = false;
    }
  };
  return operation;
}
/**
 * 编辑操作，跳转到编辑表单页
 * @param context
 */
function operationForEdit() {
  var operation = {
    onclick: function (context, $optInst) {
      var id = getIdFromContext(context);
      if (!id) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `当前数据id未设置` });
        return;
      }
      var operation = $optInst.operation;
      let pageId = operation.page && operation.page.id;
      if (!pageId) {
        $optInst.mustStopRepeatedClick=false;
        iview$Modal.error({ content: `跳转页面未设置` });
        return;
      }
      var _query = _.extend({ dataId: id }, operation.queryParams);
      toPage(pageId, _query);
      $optInst.mustStopRepeatedClick = false;
    }
  };
  return operation;
}
/**
 * 查看操作，跳转到查看页面
 * @param context
 */
function operationForView() {
  var operation = {
    onclick: function (context, $optInst) {
      var id = getIdFromContext(context);
      if (!id) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `当前数据id未设置` });
        return;
      }
      var operation = $optInst.operation;
      let pageId = operation.page && operation.page.id;
      if (!pageId) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `跳转页面未设置` });
        return;
      }
      var _query = _.extend({ dataId: id, forceView:true }, operation.queryParams);
      toPage(pageId, _query);
      $optInst.mustStopRepeatedClick = false;
    }
  };
  return operation;
}
/**
 * 删除操作
 * @param {*} context
 */
function operationForDel() {
  var operation = {
    onclick: function (context, $optInst) {
      var id = getIdFromContext(context);
      if (!id) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `当前数据id未设置` });
        return;
      }
      var metaEntity = context.metaEntity;
      var resource = context.grid && context.grid.queryResource;
      if (!resource) {
        resource = metaEntity && metaEntity.dataResource();
      }
      if (_.isEmpty(resource)) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `实体删除地址未设置` });
        return;
      }
      iview$Modal.confirm({
        title: '提示',
        content: '确定删除吗?',
        onOk: () => {
          resource.delete({ id: id }).then(function (re) {
            $optInst.mustStopRepeatedClick = false;
            context.grid && context.grid.reload();
            $optInst.$emit("successed", "del");
          });
        },
        onCancel:()=>{
          $optInst.mustStopRepeatedClick = false;
        }
      });
    }
  };
  return operation;
}

/**
 * 批量删除操作
 * @param {*} context
 */
function operationForBatchDelete() {
  var operation = {
    onclick: function (context, $optInst) {
      var metaEntity = context.metaEntity;
      //计算id字段
      var idField = null;
      if (!_.isEmpty(metaEntity)) {
        idField = metaEntity.getIdField();
      }
      var resource = context.grid && context.grid.queryResource;
      if (_.isEmpty(resource) && !_.isEmpty(metaEntity)) {
        resource = metaEntity.dataResource();
      }
      //检查当前用户对每一行数据是否有删除权限
      let opt = {}, unpermedItems = [], permedItems = [], unpermedInfo = '';
      opt[Utils.dataPermField] = Utils.permValues.del;
      var checkedRows = context.selectedItems;
      if (_.isEmpty(checkedRows)) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `必须传入选中的所有行数据` });
        return;
      }
      _.each(checkedRows, function (item) {
        let has = Utils.hasDataPerm(item, opt);
        if (!has) {
          unpermedItems.push(item);
        } else {
          permedItems.push(item);
        }
      });
      if (!_.isEmpty(unpermedItems)) {
        if (unpermedItems.length === checkedRows.length) {
          $optInst.mustStopRepeatedClick = false;
          iview$Modal.warning({
            title: '提示',
            content: '您对选中的数据没有删除权限'
          });
          return;
        } else {
          unpermedInfo = `您选中了${checkedRows.length}条数据，有${unpermedItems.length}条没有删除权限，继续删除剩下的${checkedRows.length - unpermedItems.length}条吗`;
        }
      }
      iview$Modal.confirm({
        title: '提示',
        content: unpermedInfo || '确定删除吗?',
        onOk: () => {
          _.each(permedItems, function (row) {
            let id = row[idField.name];
            resource.delete({ id: id }).then(function (re) {
              context.grid && context.grid.reload();
              $optInst.$emit("successed", "batchDelete");
            });
          });
          $optInst.mustStopRepeatedClick = false;
        },
        onCancel:()=>{
          $optInst.mustStopRepeatedClick = false;
        }
      });
    }
  };
  return operation;
}

/**
 * 数据导入操作
 */
function operationForImport() {
  var operation = {
    renderComponent: "meta-grid-import-data"
  };
  return operation;
}
/**
 * 导出
 * @param {*} context
 */
function operationForExport() {
  var operation = {
    onclick: function (context, $optInst) {
      $optInst.mustStopRepeatedClick = false;
      var resource = context.grid && context.grid.queryResource;
      var metaEntity = context.metaEntity;
      var grid = context.grid;
      if (_.isEmpty(resource) && !_.isEmpty(metaEntity)) {
        resource = metaEntity.dataResource();
      }
      if (_.isEmpty(resource)) {
        iview$Modal.error({ content: `实体查询地址未设置` });
        return;
      }
      iview$Modal.confirm({
        title: '提示',
        content: '是否导出当前列表所有数据?',
        onOk: () => {
          var queryOptions = { page_size: 500 };
          if (grid) {
            queryOptions = grid.buildQueryOptions();
            queryOptions.page_size = grid.totalCount || queryOptions.page_size;
          }
          queryOptions.total = false;
          queryOptions.page = 1;
          queryOptions.select = "*";
          //获取当前项目的swagger地址
          metabase.currentSwagger(metaEntity.projectId).then(function (swagger) {
            var exportTaskSetting = {
              "entityName": metaEntity.name,
              "swagger": swagger,
              "options": queryOptions
            };
            var metaEntity = metabase.findMetaEntity(metaEntity.name);
            var query = {};
            if (grid) {
              query = grid.$route.query;
            }
            toolServices().doExport(query, exportTaskSetting).then(function (records) {
              ExportCsv.download(metaEntity.title + ".csv", records.body.join("\r\n"));
            });
          });
        }
      });
    }
  };
  return operation;
}

/**
 * 返回到上一步路由
 * @param {*} context 
 */
function goback() {
  var operation = {
    onclick: function (context, $optInst) {
      router.go(-1);
    }
  };
  return operation;
}

/**
 * 保存数据（表单保存）
 * @param {*} context 
 */
function save() {
  var operation = {
    onclick: function (context, $optInst) {
      var form = context.form;
      if (_.isEmpty(form)) {
        $optInst.mustStopRepeatedClick = false;
        iview$Modal.error({ content: `表单保存操作必须传入表单实例参数` });
        return;
      }
      var savePromise=form.doSaveModel();
      savePromise.then(()=>{
        $optInst.mustStopRepeatedClick = false;
      },()=>{
        $optInst.mustStopRepeatedClick = false;
      });
    }
  };
  return operation;
}

var operations = {
  create: operationForCreate,
  edit: operationForEdit,
  view: operationForView,
  del: operationForDel,
  import: operationForImport,
  export: operationForExport,
  batchDelete: operationForBatchDelete,
  goback: goback,
  save: save
}

export default {
  /**
   * 根据通用操作名称，创建一个默认的操作
   * @param context
   * @param operationName
   */
  createOperation: function (operationName) {
    if (_.isEmpty(operationName)) {
      return null;
    }
    var func = null;
    _.forIn(operations, function (opFunc, key) {
      if (key.toLowerCase() == operationName.toLowerCase()) {
        func = opFunc;
        return false;
      }
    });
    if (func != null) {
      return func();
    }
    return null;
  },
  //注册部件提供的通用操作
  register(newAddedOperations){//{name:func,name2:func2}
    _.each(newAddedOperations,(func,name)=>{
      if(!operations[name]){
        operations[name]=func;
      }
    });
  }
}



