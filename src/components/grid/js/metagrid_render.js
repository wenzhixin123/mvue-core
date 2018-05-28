/**
 * 提供内置的列的渲染
 */
import controlTypeService from '../../form/js/control_type_service';
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
          params: {
            metaField:metaField,
            uploadUrl:Config.getUploadUrl()
          },
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
        },
        on: {
          btnClick:function(btn){
            btn.onclick.call(_.extend({"op":btn},context),_.extend({"checked":params.row},params));
          }
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



