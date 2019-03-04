/**
 * 运行的vue上下文参数
 */
import coreStore from '../store/core';
import mvueCore from '../index';
import userEx from './security/user-ex';
import topEntityService from "../services/store/top-entity";


var cachedContext={
  mvueComponents:null,  
  currentVue:null,
  Vue:null,
  eventBus:null,
  router:null,
  mvueToolkit:null,
  webContext:{
    contextPath:"/",
    pagePath:"",
    inSamePage:function (location) {
      var page=location;
      if(location.indexOf("#")>0){
        page=location.substring(0,location.indexOf("#"));
      }
      if(this.pagePath==page){
        return true;
      }
      return false;
    },
    store:null
  },
  consts:{
      user:{
          entityName:"user",
          idField:"id",
          nameField:"name",
          loginField:"userName",
          detailFields:"mobile,email",
          orgField:"orgId"
      },
      org:{
          entityName:"organization",
          idField:"id",
          nameField:"name",
          parentField:"parentId"
      }
  }
}

function initWebContext(location) {
  var href=location.href;
  var pathname=location.pathname;
  if(pathname!="/"){
    cachedContext.webContext.contextPath=pathname.substring(0,pathname.lastIndexOf("/")+1);
  }
  cachedContext.webContext.pagePath=href.replace(location.hash,"");
}

export default {
    init: function (Vue, opts) {
        cachedContext.Vue = Vue;
        cachedContext.eventBus = new Vue();
        if(opts && opts.mvueToolkit){
            cachedContext.mvueToolkit = opts && opts.mvueToolkit;
        }
        initWebContext(window.location);
    },
    setRouter(router) {
        cachedContext.router = router;
    },
    setVue(vue){
        cachedContext.Vue=vue;
    },
    getVue(){
        return cachedContext.Vue;
    },
    getRouter() {
        return cachedContext.router;
    },
    getContext: function () {
        return cachedContext;
    },
    getWebContext: function () {
        return cachedContext.webContext;
    },
    setCurrentVue: function (currentVue) {
        cachedContext.currentVue=currentVue;
    },
    getCurrentVue: function () {
        return cachedContext.currentVue;
    },
    getMvueToolkit: function () {
        return cachedContext.mvueToolkit;
    },
    buildResource: function (url, actions, _options) {
        const mvueToolkit = this.getMvueToolkit();
        if (mvueToolkit == null) {
            return null;
        }
        return mvueToolkit.resource(url, actions, _options);
    },
    getSession: function () {
        const mvueToolkit = this.getMvueToolkit();
        if (mvueToolkit == null) {
            return null;
        }
        return mvueToolkit.session;
    },
    getSSOClient: function () {
        const mvueToolkit = this.getMvueToolkit();
        if (mvueToolkit == null) {
            return null;
        }
        return mvueToolkit.ssoclient;
    },
    getConfig: function (configKey) {
        const mvueToolkit = this.getMvueToolkit();
        if (mvueToolkit == null) {
            return null;
        }
        if (_.isEmpty(configKey)) {
            return mvueToolkit.config;
        }
        return mvueToolkit.config.getConfigVal(configKey);
    },
    getEventBus() {
        return cachedContext.eventBus;
    },
    info: function (opts) {
        var vue = this.getCurrentVue();
        if (vue.$Message) {
            if (opts && opts.noTimeout) {
                vue.$Message.info(opts);
            } else {
                setTimeout(function () {
                    vue.$Message.info(opts);
                }, 300);
            }
        }
    },
    success: function (opts) {
        var vue = this.getCurrentVue();
        if(_.isString(opts)){
            opts={content:opts}
        }
        opts=_.extend({
            title:"操作成功"
        },opts);
        if (vue.$Message) {
            if (opts && opts.noTimeout) {
                vue.$Message.success(opts);
            } else {
                setTimeout(function () {
                    vue.$Message.success(opts);
                }, 300);
            }
        }
    },
    warning: function (opts) {
        var vue = this.getCurrentVue();
        opts=_.extend({
            title:"警告信息"
        },opts);
        if (vue.$Modal) {
            if (opts && opts.noTimeout) {
                vue.$Modal.warning(opts);
            } else {
                setTimeout(function () {
                    vue.$Modal.warning(opts);
                }, 300);
            }
        }
    },
    error: function (opts) {
        var vue = this.getCurrentVue();
        opts=_.extend({
            title:"错误信息"
        },opts);
        if (vue.$Modal) {
            if (opts && opts.noTimeout) {
                vue.$Modal.error(opts);
            } else {
                setTimeout(function () {
                    vue.$Modal.error(opts);
                }, 300);
            }
        }
    },
    confirm: function (opts) {
        var vue = this.getCurrentVue();
        opts=_.extend({
            title:"确认信息"
        },opts);
        if (vue.$Modal) {
            if (opts && opts.noTimeout) {
                vue.$Modal.confirm(opts);
            } else {
                setTimeout(function () {
                    vue.$Modal.confirm(opts);
                }, 300);
            }
        }
    },
    setConsts(cmap){
        cachedContext.consts=_.extend(cachedContext.consts,cmap);
    },
    getConsts(){
        return cachedContext.consts;
    },
    setStore(store,appCtx){
        store.registerModule('core',coreStore);
        if(appCtx&&appCtx.getAutoPageConfs){
            store.commit("core/setAutoPageConfs",appCtx.getAutoPageConfs());
        }
        cachedContext.store=store;
    },
    getStore(){
        return cachedContext.store;
    },
    setMvueComponents(mvueComponents){
        cachedContext.mvueComponents=mvueComponents;
    },
    getMvueComponents(){
        return cachedContext.mvueComponents;
    },
    initAfterAppCtxCreated(appCtx){
        if(appCtx.getMvueToolkit){
            cachedContext.mvueToolkit=appCtx.getMvueToolkit();
        }
        if(appCtx.getStore){
            this.setStore(appCtx.getStore(),appCtx);
        }
        if(appCtx.getMvueToolkit&&appCtx.getStore){
            //设置页面所有请求的权限模式header
            appCtx.getMvueToolkit().http.interceptors.request.use(config=>{
                let accessMode=appCtx.getStore().state.core.accessMode;
                if(accessMode){
                    config.headers['x-access-mode']=accessMode;
                }
                let topEntityRow=topEntityService.get();
                if(topEntityRow && !_.isEmpty(topEntityRow.value)){
                    config.headers['x-top-entity-row']=`${topEntityRow.entityName}/${topEntityRow.value}`;
                }
                return config;
            },error=>{
                return Promise.reject(error);
            });
        }
        if(appCtx.getMvueComponents){
            this.setMvueComponents(appCtx.getMvueComponents());
        }
        if(appCtx.getVue){
            let VueDef=appCtx.getVue();
            VueDef.use(mvueCore,{mvueToolkit:appCtx.getMvueToolkit()});
            this.setVue(VueDef);
        }
        if(appCtx.setMvueCore){
            appCtx.setMvueCore(mvueCore);
        }
        userEx.install();
    },
    initAfterAppStarted(appCtx){
        if(appCtx.getRouter){
            this.setRouter(appCtx.getRouter());
        }
        if(appCtx.getCurrentVue){
            this.setCurrentVue(appCtx.getCurrentVue());
        }
    },
    componentInRoute(component){
        let idKey="_uid";
        var uid=component[idKey];
        if(!uid){
            return null;
        }
        var routes=component.$route.matched;
        var matchedRoute=null;
        for(var i=routes.length-1;i>=0;i--){
            var route=routes[i];
            var rootComponents=route.instances.default;
            if(!rootComponents){
                continue;
            }
            this.visitComponents(rootComponents,(com)=>{
                if(com[idKey]==uid){
                    matchedRoute=route;
                    return false;
                }
            });
            if(matchedRoute){
                break;
            }
        }
        return matchedRoute;
    },
    visitComponents(com,process){
        if(com){
            let result=process(com);
            if(result===false){
                return false;
            }
        }
        if(com.$children){
            var result=null;
            _.forEach(com.$children,(children,index)=>{
               var result =this.visitComponents(children,process);
               if(result===false){
                   result=false;
                   return result;
               }
            });
            if(result===false){
                return result;
            }
        }
    }

}
