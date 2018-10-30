/**
 * 获取元数据相关信息的接口，包括表单、视图、套件和项目等基本信息获取接口
 * swagger json定义：https://developer.bingosoft.net:12100/services/metaservice/swagger.json
 */
import mvueToolkit from "mvue-toolkit";
var Config=require("../../config/config.js");
var metaserviceUrl=Config.getMetaserviceUrl();

var customActions = {
    getFormByShortId: {method: 'GET', url: 'meta_form/default/short{/id}'},
    getProject: {method: 'GET', url: 'meta_project{/id}'},
    getSuite: {method: 'GET', url: 'meta_suite{/id}'},
    getSuiteDataSetting: {method: 'GET', url: 'meta_suite_data_setting{/id}'},
    saveArchive: {method: 'POST', url: 'meta_suite_data_setting/archive',headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' }, emulateJSON: true},
    getView: {method: 'GET', url: 'meta_view{/id}'},
    getViewByShortId: {method: 'GET', url: 'meta_view/default/short{/id}'},
    getEntityTemplate:{method:'GET',url:'meta_template/entity_template'},
    getEntity:{method:'GET',url:'meta_entity{/id}'}
};
var $resource=mvueToolkit.resource('meta_form{/id}',customActions,{root:metaserviceUrl});

export default{
    getForm:$resource.get,
    getFormByShortId:$resource.getFormByShortId,
    getProject:$resource.getProject,
    getSuite:$resource.getSuite,
    saveArchive:$resource.saveArchive,
    getSuiteDataSetting:$resource.getSuiteDataSetting,
    getView:$resource.getView,
    getViewByShortId:$resource.getViewByShortId,
    getEntityTemplate:$resource.getEntityTemplate,
    getEntity:$resource.getEntity
}
