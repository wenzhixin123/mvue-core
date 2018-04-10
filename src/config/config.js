/**
 * 系统相关配置信息
 */
if (!window.config) {
  alert("全局配置文件未引入，请检查项目代码");
}

var cachedConfig=null;
/**
 * 根据配置项Key获取配置
 * @param key 配置项Key
 * @returns {*} 配置项的值
 */
function getConfigVal(key){
  var serverConfig=loadServerConfig();
  return serverConfig[key];
};

/**
 * 同步加载服务端的配置
 */
function loadServerConfig(){
  if(cachedConfig!=null){
    return cachedConfig;
  }
  jQuery.ajax({
    url:getServerConfigUr(),
    dataType:"json",
    async:false,
    statusCode:{404:function () {
        alert("请确认配置服务器地址是否正确，配置地址如下："+getServerConfigUr());
      }},
    success:function (serverConfig) {
      cachedConfig=_.extend({},window.config,serverConfig);
    }
  });
  return cachedConfig;
};

/**
 * 获取配置服务地址
 * @returns {string}
 */
function getServerConfigUr(){
  if(window.config.configUrl){
    return window.config.configUrl;
  }
  return window.config.baseServerUrl+"/conifg";
};

var mergedConfig=_.extend({},window.config);
/**
 * 获取指定key对应的配置项值
 * @param key
 * @returns {*}
 */
mergedConfig.getConfigVal=function(key){return getConfigVal(key);}

/**
 * 从服务端加载配置项
 */
mergedConfig.loadServerConfig=function(){return loadServerConfig();}
/**
 * 获取SSO服务器地址
 * @returns {*}
 */
mergedConfig.getSSOServerUrl=function () {
  var key="ssoServerUrl";
  return getConfigVal(key);
};
/**
 * 获取SSO服务器版本号
 * @returns {*}
 */
mergedConfig.getSSOVersion=function () {
  var key="ssoVersion";
  return getConfigVal(key);
};
/**
 * SSO中OAuth2的类型：implicit、accessCode、accessCodeProxy
 * @returns {*}
 */
mergedConfig.getOAuth2FlowType=function () {
  var key="oauth2Flow";
  var type= getConfigVal(key);
  if(!_.isEmpty(type)){
    return type;
  }
  //计算type的默认值
  var authAccessCodeProxyUrl=this.getAuthAccessCodeProxyUrl();
  if(authAccessCodeProxyUrl!=null && authAccessCodeProxyUrl.length>0){
    type="accessCodeProxy";
  }else{
    var clientSecret=this.getClientSecret();
    if(clientSecret!=null && clientSecret.length>0){
      type="accessCode";
    }else{
      type="implicit";
    }
  }
};

/**
 * 获取服务器端代理验证授权码（accessCode）的地址
 * @returns {*}
 */
mergedConfig.getAuthAccessCodeProxyUrl=function () {
  var key="authAccessCodeProxyUrl";
  return getConfigVal(key);
};
/**
 *  获取API服务器地址
 * @returns {*}
 */
mergedConfig.getApiBaseUrl=function () {
  var url="";
  var key="apiBaseUrl";
  url=getConfigVal(key);
  if(!_.isEmpty(url)){
    return url;
  }
  //未配置时，使用配置的基地址为api地址
  url=window.config.baseServerUrl;
};

/**
 * 获取网关地址
 * @returns {*}
 */
mergedConfig.getGatewayUrl=function () {
  var url="";
  var key="service.gateway.endpoint";
  url=getConfigVal(key);
  if(!_.isEmpty(url)){
    return url;
  }
  //未配置时，使用配置的基地址为网关地址
  url=window.config.baseServerUrl;
};

/**
 * 获取查询当前用户信息的接口
 * @returns {*}
 */
mergedConfig.getUserInfoUrl=function () {
  var url="";
  var key="userInfoUrl";
  url=getConfigVal(key);
  if(url!=null || url.length>0){
    return url;
  }
  //未配置时，默认使用oauth2的userInfo接口
  url=this.getSSOServerUrl()+"/oauth2/userinfo";
};

/**
 * 获取客户端的ClientId
 * @returns {*}
 */
mergedConfig.getClientId=function () {
  var key="clientId";
  return getConfigVal(key);
};
/**
 * 获取客户端密钥
 * @returns {*}
 */
mergedConfig.getClientSecret=function () {
  var key="clientSecret";
  return getConfigVal(key);
};

/**
 * 获取元数据服务的地址，包括表单、视图、套件和项目等基本信息获取接口
 * @returns {*}
 */
mergedConfig.getMetaserviceUrl = function () {
  return getConfigVal("service.metabase.endpoint");
};
/**
 * 获取上传下载的服务器地址
 * @returns {*}
 */
mergedConfig.getUploadUrl=function () {
  var key="service.stream.endpoint";
  return getConfigVal(key);
};
/**
 * 用户api访问地址
 * @returns {*}
 */
mergedConfig.getUserApiUrl=function () {
  var key="userApiUrl";
  return getConfigVal(key);
};
/**
 * 部门api访问地址
 * @returns {*}
 */
mergedConfig.getOrgApiUrl=function () {
  var key="orgApiUrl";
  return getConfigVal(key);
};

module.exports = mergedConfig;
