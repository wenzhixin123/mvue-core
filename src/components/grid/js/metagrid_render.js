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
   * 密文控件
   * @param metaField
   * @returns {Function}
   */
  renderForPassword: function (context, metaField) {
    return function (h, params) {
      var value = controlTypeService.formatData(params.row, metaField);
      return h("m-grid-password", {
        props: {
          value:value
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
          params: {
            metaField:metaField,
            uploadUrl:globalContext.getConfig().getUploadUrl()
          },
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
          params: {
            metaField:metaField,
            uploadUrl:globalContext.getConfig().getUploadUrl()
          },
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
                btnOpts={name:"edit"};
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
                            return false;
                        }
                    });
                }
            }
            if(btnOpts==null){
                btnOpts={name:"edit"};
            }
            if(context.grid){
              btnOpts.entityName=context.grid.metaEntity.name;
            }
            var oper=gridOperations.create(btnOpts);

            return h("m-grid-link-title", {
                props: {
                    params:metaField,
                    item: params.row,
                    context:context,
                    btn:oper,
                    initialCol:initialCol
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
            metaField:metaField,
            wordlimit:31
          },
          btns:btns,
          item: params.row,
          grid:context.grid
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
    return function(h,params){
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
          initialCol:initialCol
        }
      });
    }
  }
}



