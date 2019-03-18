/**
 * 提供内置的列的渲染
 */
import controlTypeService from '../../form/js/control_type_service';
import gridOperations from "../../../libs/operation/operations";
import globalContext from "../../../libs/context";
var pathToRegexp = require('path-to-regexp');

function goto(router) {
    if(_.has(router,"path")){
        var path= pathToRegexp.compile(router.path)(router.params);
        router.path=path;
    }
    globalContext.getRouter().push(router);
}

export default {
  /**
   * 关系字段显示
   * @param metaField
   * @returns {Function}
   */
  renderForRelationField: function (context, metaField,column,targetField) {
    return function (h, params) {
      return h("m-grid-relation-field", {
        props: {
          item:params.row,
          column:column,
          targetField:targetField
        }
      });
    }
  },
  /**
   * 密文控件
   * @param metaField
   * @returns {Function}
   */
  renderForPassword: function (context, metaField) {
    return function (h, params) {
      var value = controlTypeService.formatData(params.row, metaField);
      return h("m-grid-password", {
        props: {
          value:value,
          metaField:metaField,
          context:context,
          item: params.row
        }
      });
    }
  },
  /**
   * 图片上传控件
   * @param metaField
   * @returns {Function}
   */
  renderForPictureUpload: function (context, metaField) {
    return function (h, params) {
      return h("m-grid-pictures", {
        props: {
          metaField:metaField,
          uploadUrl:globalContext.getConfig().getUploadUrl(),
          context:context,
          item: params.row
        }
      });
    }
  },

  /**
   * 文件上传控件
   * @param metaField
   * @returns {*}
   */
  renderForFileUpload: function(context, metaField) {
    return function (h, params) {
      return h("m-grid-files", {
        props: {
          uploadUrl:globalContext.getConfig().getUploadUrl(),
          metaField:metaField,
          context:context,
          item: params.row
        }
      });
    }
  },

  /**
   * 带图片的标题头显示
   * @returns {*}
   */
  renderForImgTitle: function (context, metaField) {
    return function (h, params) {
      return h("m-grid-img-title", {
        props: {
          params: _.extend({
              uploadUrl:globalContext.getConfig().getUploadUrl()
            },metaField),
          metaField:metaField,
          context:context,
          item: params.row
        },
        on: {
          click: function () {
            metaField.actionFunc && metaField.actionFunc.call(context, params);
          }
        }
      });
    }
  },

    renderForLinkTitle: function (context, metaField,idFieldName,initialCol) {
        return function (h, params) {
            var btnOpts=null;
            var clickHandler=context.grid&&context.grid.handleOnTitleClick;
            if(clickHandler){
                btnOpts={name:"edit",security:["find"]};
                if(_.isFunction(clickHandler)){
                    btnOpts["onclick"]=clickHandler;
                }else if(_.isString(clickHandler)) {
                    btnOpts["to"] = clickHandler;
                }else{
                    btnOpts=_.assign(btnOpts,clickHandler);
                }
            }
            if(btnOpts==null){
                if(context.grid.toolbar && context.grid.toolbar.singleBtns){
                    _.forEach(context.grid.toolbar.singleBtns,btn=>{
                        if(btn.name=="edit"){
                            btnOpts=btn;
                            btnOpts=Object.assign(btnOpts,{
                                security:["find"]
                            });
                            return false;
                        }
                    });
                }
            }
            if(btnOpts==null){
                btnOpts={name:"edit",security:["find"]};
            }
            if(context.grid){
              btnOpts.entityName=context.grid.metaEntity.name;
            }
            var oper=gridOperations.create(btnOpts);
            return h("m-grid-link-title", {
                props: {
                    item: params.row,
                    context:context,
                    btn:oper,
                    initialCol:initialCol,
                    metaField:metaField
                }
            });
        }
    },

  /**
   * 带操作的标题头显示
   * @returns {*}
   */
  renderForOptsTitle: function (context, metaField) {
    let btns=context.grid.innerToolbar.singleBtns;
    return function (h, params) {
      return h("m-grid-opts-title", {
        props: {
          params: {
            wordlimit:31
          },
          btns:btns,
          grid:context.grid,
          metaField:metaField,
          context:context,
          item: params.row
        }
      });
    }
  },

  /**
   * 操作列
   * @param metaField
   * @returns {Function}
   */
  /**
   * 操作列
   * @param metaField
   * @returns {Function}
   */
  renderForOperation:function (context,metaField) {
    let btns=context.grid.innerToolbar.singleBtns;
    let batchEditor=false;
    btns.forEach(btn => {
      if(btn.name=='openEdit'){
        batchEditor=true;
        return false;
      }
    });
    
    return function(h,params){
      if(batchEditor){
        let idFieldName=context.grid.metaEntity.getIdField().name;
        let id=params.row[idFieldName];
        context.grid.rowMap[id]=params.row;
      }
      return h("m-grid-operation-btn",{
        props:{
          btns:btns,
          item: params.row,
          context:context
        }
      });
    }
  },
  /**
   *  行编辑状态列
   * @param metaField
   * @returns {Function}
   */
  renderForRowStatus:function (context,metaField,options) {
    return function(h,params){
      return h("m-grid-row-status",{
        props:{
          item: params.row,
          context:context,
          options:options,
          metaField:metaField
        }
      });
    }
  },

  /**
   * 通用渲染
   * @param metaField
   * @returns {Function}
   */
  renderForCommon: function (context, metaField,initialCol) {
    return function (h, params) {
      var value = controlTypeService.formatData(params.row, metaField);
      return h("m-grid-render-html", {
        props: {
          value: value,
          initialCol:initialCol,
          item: params.row,
          context:context,
          metaField:metaField
        }
      });
    }
  }
}



