/**
 * 封装AJAX请求相关操作
 * Created by yulongsheng on 2016/10/28.
 */
var session=require("./security/session");

var ax = {};
ax.ajax = function (params) {
  var defaultOptions = {
    type: "GET",
    url: "",
    async: true,
    cache: false,
    contentType: "application/json",
    data: {},
    timeout: 60000,
    headers: params.header || {},
    complete: '',
    success: params.success,
    error: params.error
  }
  $.extend(defaultOptions, params || {});
  $.ajax(defaultOptions);
};

ax.callAjax = function (type, url, data, success, error, _options) {
  var _vue=new Vue();
  var options = $.extend({}, _options);
  var beforeSend = function (xhr, options) {
    if (_options && _options.showLoading) {
      // 请求发送前加载中提示
      _vue.$Spin.show();
    }
    if (_options && _options.beforeSend) {
      _options.beforeSend(xhr, options);
    }
  };
  options.beforeSend = beforeSend;
  var complete = function (xhr, status) {
    if (_options && _options.showLoading) {
      // 请求发送前加载中提示
      _vue.$Spin.show();
    }
    if (_options && _options.complete) {
      _options.complete(xhr, status);
    }
  };
  options.complete = complete;
  var params = {
    type: type,
    url: url,
    data: data,
    success: success,
    error: function (xhr, textStatus, errorThrown) {
      // 遇到401，进行用户重登
      if (xhr.status == 401) {
        var hideError = false;
        if (_.isEmpty(session.getToken())) {
          hideError = true;
        }
        session.doLogout();
        session.doLogin(window.location.href);
        return;
      }
      //如果用户自定义了异常处理，用用户自定义的
      if (jQuery.isFunction(error)) {
        error(xhr, textStatus, errorThrown);
        return;
      }
      if(xhr.status==403){
        iview$Modal.warning({
            title: "系统提示",
            content: "您没有此操作权限"
        });
      }else if (xhr.status == 400) {
        iview$Modal.error({
          title: "系统提示",
          content: "服务器异常:" + errorThrown
        });
      } else {
        var errorMsg = "服务器内部错误！";
        try {
          var jsonExceptionResp = $.parseJSON(xhr.responseText);
          if (jsonExceptionResp.responseJSON && jsonExceptionResp.responseJSON.message) {
            errorMsg = jsonExceptionResp.responseJSON.message;
          } else {
            errorMsg = jsonExceptionResp.message || jsonExceptionResp.error.reason;
          }
        } catch (ex) {

        }
        if (typeof errorMsg == "undefined") {
          errorMsg = "服务器内部错误！";
        }
        iview$Modal.error({
          title: "错误提示",
          content: errorMsg
        });
      }
    }
  };
  // accessToken加到请求头
  var token = session.getToken();
  if (!_.isEmpty(token)) {
    params["header"] = {
      "Authorization": "Bearer " + token,
      "version": "3.6.0"
    }
  }
  $.extend(params, options || {});
  ax.ajax(params);
}

ax.ajaxWithOutToken = function (type, url, data, success, error, options) {
  ax.ajax($.extend({
    type: type,
    url: url,
    data: data,
    success: success,
    error: error
  }, options));
}

ax.post = function (url, data, success, error, options) {
  ax.callAjax("POST", url, data, success, error, options);
}

ax.get = function (url, data, success, error, options) {
  ax.callAjax("GET", url, data, success, error, options);
}

ax.delete = function (url, data, success, error, options) {
  ax.callAjax("DELETE", url, data, success, error, options);
}

ax.patch = function (url, data, success, error, options) {
  ax.callAjax("PATCH", url, data, success, error, options);
}
module.exports = ax

