/**
 * 获取元数据相关信息的接口，包括表单、视图、套件和项目等基本信息获取接口
 * swagger json定义：https://developer.bingosoft.net:12100/services/metaservice/swagger.json
 */
import context from "../../libs/context";

var $resource=null;
var remotePages={};
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

async function getPage(key) {
    if(remotePages[key]){
        return remotePages[key];
    }
    let page=await $resource.request({
        url:`$pages/${key}`
    });
    if(page){
        remotePages[key]=page.data;
    }
    return page.data;
}

export  default function () {
    if($resource!=null){
        return $resource;
    };
    let baseServiceRoot=context.getMvueToolkit().config.getMetaserviceUrl();
    if(!baseServiceRoot){
        baseServiceRoot=context.getMvueToolkit().config.getApiBaseUrl();
    }
    $resource=context.buildResource('meta_form{/id}',customActions,{root:baseServiceRoot});
    $resource=_.assign($resource,{
        getForm:$resource.get,
        getPage:getPage
    });
    return $resource;
};
