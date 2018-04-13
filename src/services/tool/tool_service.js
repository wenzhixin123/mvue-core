/**
 * 获取元数据相关信息的接口，包括表单、视图、套件和项目等基本信息获取接口
 * swagger json定义：https://developer.bingosoft.net:12100/services/metaservice/swagger.json
 */
var Config=require("../../config/config.js");
var toolBaseUrl=Config.getToolEndpoint();

var customActions = {
  doImport: {method: 'POST', url: 'import'},
  doExport: {method: 'POST', url: 'export'},
  getImportMapping: {method: 'GET', url: 'import/mapping'},
  getImportProgress: {method: 'GET', url: 'import/progress'},
  getImportReport: {method: 'GET', url: 'import/report'},
  currentUser: {method: 'GET', url: 'user/info'},
};
var $resource=Vue.resource('import',null,customActions,{root:toolBaseUrl});

export default {
  doImport: $resource.doImport,
  getImportMapping: $resource.getImportMapping,
  getImportProgress: $resource.getImportProgress,
  getImportReport: $resource.getImportReport,
  currentUser: $resource.currentUser,
  doExport: $resource.doExport,
}
