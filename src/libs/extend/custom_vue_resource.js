var Config=require("../../config/config.js");
module.exports=function CustomVueResource(Vue,VueResource){
    Vue.http.options.root = _.trimEnd(Config.getApiBaseUrl(),"/");
    Vue.resource.actions.update={ method: 'PATCH' };
    Vue.http.interceptors.push(function(request, next) {
        var _this=this;
        if(_this instanceof Vue && _this.showLoading){
            // 请求发送前加载中提示
            _this.$Spin.show();
        }
        var token = mvueCore.session.getToken();
        if (token) {
            request.headers.set('Authorization','Bearer '+ token);
            request.headers.set('version','3.6.0');
        }
        next(function(response) {
            if(_this instanceof Vue && _this.showLoading===false){
                _this.showLoading=true;
            }
            if(_this instanceof Vue){
                // 请求结束关闭加载中
                _this.$Spin.hide();
            }
            var isError=false;
            if(response.status === 401) {
                isError=true;
                mvueCore.session.gotoLogin(window.location.href);
            }else if(response.status==404){
                isError=true;
            }else if (response.status>=400){
                isError=true;
                var message=response.data;
                if(!!message.message){
                    message=message.message;
                }
                if(!message){
                    message=response.statusText;
                }
                if(response.status==403){
                    message=response.status+" Forbidden 操作被禁止";
                }
                iview$Modal.error({
                    title: "系统提示",
                    content: "服务器异常:"+message
                });
            }else if(response.status == 0){
                isError=true;
                console.error(response.data);
                iview$Modal.error({
                    title: "系统提示",
                    content: "请求出现异常，请检查网络连接！"
                });
            }
            //如果有异常终止处理链
            if(isError){
                return Promise.reject();
            }
            // 请求发送后的处理逻辑
            // 根据请求的状态，response参数会返回给successCallback或errorCallback
            return response;
        })
    })
};
