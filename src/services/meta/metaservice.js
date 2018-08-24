/**
 * 获取元数据相关信息的接口，包括表单、视图、套件和项目等基本信息获取接口
 * swagger json定义：https://developer.bingosoft.net:12100/services/metaservice/swagger.json
 */
import context from "../../libs/context";

var $resource=null;
var customActions = {
    getFormByShortId: {method: 'GET', url: 'meta_form/short{/id}'},
    getProject: {method: 'GET', url: 'meta_project{/id}'},
    getSuite: {method: 'GET', url: 'meta_suite{/id}'},
    getSuiteDataSetting: {method: 'GET', url: 'meta_suite_data_setting{/id}'},
    saveArchive: {method: 'POST', url: 'meta_suite_data_setting/archive'},
    getView: {method: 'GET', url: 'meta_view{/id}'},
    getViewByShortId: {method: 'GET', url: 'meta_view/short{/id}'},
    getEntityTemplate:{method:'GET',url:'meta_template/entity_template'}
};

export  default function () {
    if($resource!=null){
        return $resource;
    };
    const baseServiceRoot=context.getMvueToolkit().config.getMetaserviceUrl();
    $resource=context.buildResource('meta_form{/id}',customActions,{root:baseServiceRoot});
    return {
        getForm:$resource.get,
        getFormByShortId:$resource.getFormByShortId,
        getProject:$resource.getProject,
        getSuite:$resource.getSuite,
        saveArchive:$resource.saveArchive,
        getSuiteDataSetting:$resource.getSuiteDataSetting,
        getView:$resource.getView,
        getViewByShortId:$resource.getViewByShortId,
        getEntityTemplate:$resource.getEntityTemplate,
    }
};
