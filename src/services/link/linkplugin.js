/**
 * PC端提供给第三方应用使用的接口
 */
let linkplugin = {
    isInPc : !!(app && app.window && app.window.open),
    isUnder425 : this.isInPc && typeof app.window.showDevTools !== 'function', //PCLink 4.2.5版本之下, 用浏览器属性判断
    //发起聊天
    openChat:this.isUnder425 ? this.openChatUnder425 : this.openChat,
    //获取分享的云盘文件
    getDiskShareFile: this.isUnder425 ? this.getDiskShareFileUnder425 : this.getDiskShareFile,
    //选人联系人
    selectContact: this.selectContact,
    //分享到聊天
    shareToChat: this.shareToChat,
    //分享项目主页到聊天
    shareProjectToChat: this.shareProjectToChat,
    //打开没有标题栏的窗口
    openNoTitleWindow: this.openNoTitleWindow,
    //打开有标题栏的窗口
    openWindow: this.openWindow,
  
    /**
     * 分享项目主页到聊天
     * options json 参数
     * -selected json数组 已选择的联系人
     *  {id: xx, name: xx, type: xx, eCode: xx}
     *   id: 数据id
     *   type: 1 用户 2群组 4部门 5服务号 13用户标签
     * -content string 消息内容
     * -onlySelectOne Boolean 是否只选择一条数据， 默认false
     * -onlySelectOrg Boolean 是否只选择部门数据，默认false
     * -needMyGroup Boolean 是否显示我的群组，默认false
     */
    shareProjectToChat:(options)=>{
        options.msgType = 11;
        linkplugin.shareToChat(options);
    },
    /**
     * 分享到聊天
     */
    shareToChat:(options)=>{
        app.trigger('ProxyOpenContactSelect', [{
            type: "ShareToChat",
            selectedUsers: options.selected || [],
            options: {
                onlySelectOne: options.onlySelectOne || false,
                needMyGroup: options.needMyGroup || false,
                needScopeAllUser: options.needScopeAllUser || false,
                onlySelectOrg: options.onlySelectOrg || false,
                msgInfo: {
                    msgType: options.msgType,
                    content: options.content
                }
            }
        }]);
    },
    openChatUnder425:(id, type, name, callback) =>{
        var encodeName = "";
        /*---------------------4.2.5版本之下接口（包含4.2.5）------------------*/
        //发起聊天
        app.window.exists('chatWindow', function (exists) {
            if (exists) {
                app.trigger('openChatEvent', [[{ id: id, type: type, name: encodeName }]]);
                callback && callback();
            } else {
                var bounds = { width: 720, height: 540 },
                    boundsFlag = "WindowCenter";
                app.window.open({
                    uri: "html/chat.html?id=" + id + "&type=" + type + "&name=" + encodeName,
                    name: 'chatWindow',
                    bounds: bounds,
                    userData: {
                        users: [{ id: id, type: type, name: encodeName }]
                    },
                    boundsFlag: boundsFlag,
                    radian: 5,
                    windowFlag: 'AcceptFiles',
                    minWidth: 720,
                    minHeight: 540,
                    showMode: 'Normal',
                    title: name,
                    success: function () {
                        callback && callback();
                    }
                });
            }
        });
    },
    //获取分享的云盘文件
    getDiskShareFileUnder425:(callback) =>{
        var diskServiceUrl = "",
            diskUserData = {
                oper: "share",
                closeTriggerEventName: "WebDiskFileEvent"
            }
        var cloudHandle = 'webDiskFileHandle';
        app.window.exists(cloudHandle, function (exists) {
            if (!exists) {
                app.window.open({
                    uri: "html/cloud_disk.html",
                    name: cloudHandle,
                    bounds: {
                        width: 576,
                        height: 473
                    },
                    userData: diskUserData,
                    minWidth: 576,
                    minHeight: 473,
                    boundsFlag: 'WindowCenter',
                    showMode: 'Normal',
                    radian: 5
                });
            } else {
                app.window.show(cloudHandle);
            }

            app.listen("WebDiskFileEvent", function (files) {
                if (files instanceof Array && files.length == 1 && files[0] instanceof Array) {
                    files = files[0];
                }
                callback(files);
            });
        });
    },
    /*---------------------4.2.6版本以上接口----------------------------*/
    /*
     * 发起聊天
     * id, type, name 必填
     */
    openChat:(id, type, name, callback) =>{
        app.trigger('ProxyOpenChat', [{
            id: id,
            name: name,
            type: type,
            needAddSession: true
        }]);
        callback && callback();
    },
    /*
     * 获取分享的云盘文件
     * callback 必填， 里面返回所分享文件（包含分享地址）
     */
    getDiskShareFile:(callback) =>{
        let closeTriggerEventName = 'WebDiskFileEvent' + new Date().getTime();
        app.trigger('ProxyOpenDiskSelect', [{
            oper: "share",
            closeTriggerEventName: closeTriggerEventName
        }]);
        app.listen(closeTriggerEventName, function (files) {
            callback(files);
            setTimeout(function(){
                app.removeListen(closeTriggerEventName);
            }, 1000);
        });
    },

    /*
     * 选择联系人
     * options json 参数
     *    -selected json数组 已选择的联系人
     *              {id: xx, name: xx, type: xx, eCode: xx}
     *              id: 数据id
     *              type: 1 用户 2群组 4部门 5服务号 13用户标签
     *    -onlySelectOne Boolean 是否只选择一条数据， 默认false
     *    -onlySelectOrg Boolean 是否只选择部门数据，默认false
     *    -onlyManageServiceNo Boolean 是否只选择我的服务号，默认false
     *    -needMyGroup Boolean 是否显示我的群组，默认false
     *    -needContactLabel Boolean 是否显示用户标签，默认false
     *    -needScopeAllUser Boolean 搜索是否允许查询所有用户，默认false
     *    -canSelectOrg Boolean 是否能选择部门，默认false
     *    -callback function 回调函数，里面返回选择的联系人（json数组）
     */
    selectContact:(options) =>{
        var closeTriggerEventName = 'SelectContactEvent' + new Date().getTime();
        app.trigger('ProxyOpenContactSelect', [{
            type: "SelectContact",
            selectedUsers: options.selected || [],
            closeWinTriggerEvent: closeTriggerEventName,
            options: {
                onlySelectOne: options.onlySelectOne || false,
                needMyGroup: options.needMyGroup || false,
                needScopeAllUser: options.needScopeAllUser || false,
                onlySelectOrg: options.onlySelectOrg || false,
                onlyManageServiceNo: options.onlyManageServiceNo || false,
                needContactLabel: options.needContactLabel || false,
                needMyBusiness: options.needMyBusiness || false,
                canSelectOrg: options.canSelectOrg || false
            }
        }]);
        app.listen(closeTriggerEventName, function (files) {
            options.callback && options.callback(files);
            setTimeout(function(){
                app.removeListen(closeTriggerEventName);
            }, 1000);
        });
    },

    //打开没有标题栏的窗口
    openNoTitleWindow: (url, title) => {
        app.trigger('ProxyOpenNoTitleWindow', [url, title]);
    },

    /**
     * 打开有标题栏的窗口
     * url string 链接地址（必填）
     * title string 窗口标题
     * needAuth boolean 需要认证，默认是true
     * callback function 回调函数，成功打开后。
     */
    openWindow: (url, title, needAuth, callback) => {
        app.trigger('ProxyOpenWindow', [{
            url: url,
            name: title,
            needTicket: needAuth || true,
            callback: callback
        }]);
    }
}
module.exports = linkplugin;