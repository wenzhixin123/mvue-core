/**
 * 提供内置的列的渲染
 */
import controlTypeService from '../../form/js/control_type_service';
import gridOperations from "./metagrid_operation";
var Config=require("../../../config/config.js");

export default {
  /**
   * 图片上传控件
   * @param metaField
   * @returns {Function}
   */
  renderForPictureUpload: function (context, metaField) {
    return function (h, params) {
      return h("meta-grid-pictures", {
        props: {
          params: {
            metaField:metaField,
            uploadUrl:Config.getUploadUrl()
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
      return h("meta-grid-files", {
        props: {
          params: {
            metaField:metaField,
            uploadUrl:Config.getUploadUrl()
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
      return h("meta-grid-img-title", {
        props: {
          params: _.extend({
              uploadUrl:Config.getUploadUrl()
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

    renderForLinkTitle: function (context, metaField,idFieldName) {
        return function (h, params) {
            return h("meta-grid-link-title", {
                props: {
                    params:metaField,
                    item: params.row
                },
                on: {
                    click: function (item) {
                        if(metaField.actionFunc){
                            metaField.actionFunc.call(context, params);
                            return ;
                        }
                        var id=item[idFieldName];
                        var wrappedContext=_.extend({
                            selectedId:id
                        },context);
                        var editorOp=gridOperations.createOperation("edit");
                        editorOp.onclick(wrappedContext,{operation:{}});
                    }
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
      return h("meta-grid-opts-title", {
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
      return h("meta-grid-operation-btn",{
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
  renderForCommon: function (context, metaField) {
    return function (h, params) {
      var value = controlTypeService.formatData(params.row, metaField);
      return h("meta-grid-render-html", {
        props: {
          value: value
        }
      });
    }
  }
}



