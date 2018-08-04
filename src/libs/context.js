/**
 * 运行的vue上下文参数
 */

var cachedContext={
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
  init:function (Vue,opts) {
    cachedContext.Vue=Vue;
    cachedContext.eventBus=new Vue();
    cachedContext.mvueToolkit=opts&&opts.mvueToolkit;
    initWebContext(window.location);
  },
  setRouter(router){
      cachedContext.router=router;
  },
  getRouter(){
      return cachedContext.router;
  },
  getContext:function () {
    return cachedContext;
  },
  getWebContext:function () {
    return cachedContext.webContext;
  },
  getCurrentVue:function () {
    return cachedContext.Vue;
  },
  getMvueToolkit:function () {
    return cachedContext.mvueToolkit;
  },
  buildResource:function (url, actions,_options) {
    const  mvueToolkit=this.getMvueToolkit();
    if(mvueToolkit==null){
      return null;
    }
    return mvueToolkit.resource(url, actions,_options);
  },
  getSession:function () {
    const  mvueToolkit=this.getMvueToolkit();
    if(mvueToolkit==null){
      return null;
    }
    return mvueToolkit.session;
  },
  getSSOClient:function () {
    const  mvueToolkit=this.getMvueToolkit();
    if(mvueToolkit==null){
      return null;
    }
    return mvueToolkit.ssoclient;
  },
  getConfig:function (configKey) {
    const  mvueToolkit=this.getMvueToolkit();
    if(mvueToolkit==null){
      return null;
    }
    if(_.isEmpty(configKey)){
      return mvueToolkit.config;
    }
    return mvueToolkit.config.getConfigVal(configKey);
  },
  getEventBus(){
    return cachedContext.eventBus;
  }
}
