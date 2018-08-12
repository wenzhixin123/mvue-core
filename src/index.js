function installGridAndForm(Vue){
    Vue.component('meta-grid-render-html',require("./components/grid/render_html"));
    Vue.component('meta-grid-operation-btn',require("./components/grid/operation_btn"));
    Vue.component('meta-grid-img-title',require("./components/grid/img_title"));
    Vue.component('meta-grid-opts-title',require("./components/grid/opts_title"));
    Vue.component('meta-grid-link-title',require("./components/grid/link_title"));
    Vue.component('meta-grid-pictures',require("./components/grid/pictures"));
    Vue.component('meta-grid-files',require("./components/grid/files"));
    Vue.component('meta-grid-import-data',require("./components/grid/import_data.vue"));
    Vue.component('meta-grid',require("./components/grid/iview_grid.vue"));
    Vue.component('meta-operation',require("./components/meta_operation/operation"));

    Vue.component('MetaSingleLineText',require('./components/form/control_tmpl/single_line_text')),
    Vue.component('MetaMultiLineText',require('./components/form/control_tmpl/multi_line_text')),
    Vue.component('MetaRadioButton',require('./components/form/control_tmpl/radio_button')),
    Vue.component('MetaDescription',require('./components/form/control_tmpl/description')),
    Vue.component('MetaDivisionLine',require('./components/form/control_tmpl/division_line')),
    Vue.component('MetaCheckboxGroup',require('./components/form/control_tmpl/checkbox_group')),
    Vue.component('MetaSingleSelect',require('./components/form/control_tmpl/single_select')),
    Vue.component('MetaDate',require("./components/form/control_tmpl/date")),
    Vue.component('MetaDateRange',require("./components/form/control_tmpl/daterange")),
    Vue.component('MetaTime',require("./components/form/control_tmpl/time")),
    Vue.component('MetaTimeRange',require("./components/form/control_tmpl/timerange")),
    Vue.component('MetaDateTime',require("./components/form/control_tmpl/datetime")),
    Vue.component('MetaDateTimeRange',require("./components/form/control_tmpl/datetimerange")),
    Vue.component('MetaNumberInput',require('./components/form/control_tmpl/number_input')),
    Vue.component('MetaFileUpload',require('./components/form/control_tmpl/file_upload')),
    Vue.component('MetaPictureUpload',require('./components/form/control_tmpl/picture_upload')),
    Vue.component('MetaSingleUserSelect',require('./components/form/control_tmpl/single_user_select')),
    Vue.component('MetaSingleOrgSelect',require('./components/form/control_tmpl/single_org_select')),
    Vue.component('MetaMultiUserSelect',require('./components/form/control_tmpl/multi_user_select')),
    Vue.component('MetaMultiOrgSelect',require('./components/form/control_tmpl/multi_org_select')),
    Vue.component('MetaCascadeSelect',require('./components/form/control_tmpl/cascade_select')),
    Vue.component('MetaRefEntity',require('./components/form/control_tmpl/ref_entity')),
    Vue.component('MetaBoolean',require('./components/form/control_tmpl/boolean')),
    Vue.component('MetaGroup',require('./components/form/control_tmpl/group'));
    Vue.component('meta-field',require('./components/form/metafield'));
    Vue.component('meta-form',require('./components/form/metaform'));
    Vue.component('MetaIssuedNumber',require('./components/form/control_tmpl/issued_number')),

     //begin new added for pclink
    Vue.component('MetaPclinkSingleUserSelect',require("./components/form/pclink/single_user_select"));
    Vue.component('MetaPclinkSingleOrgSelect',require("./components/form/pclink/single_org_select"));
    Vue.component('MetaPclinkMultiUserSelect',require("./components/form/pclink/multi_user_select"));
    Vue.component('MetaPclinkMultiOrgSelect',require("./components/form/pclink/multi_org_select"));
    //end new added for pclink

    //通用组件定义
    //Vue.component('select-user-modal',require('./components/common/select_user_modal'));
}
import metabase from './libs/metadata/metabase';
import metaentity from './libs/metadata/metaentity';
import utils from './libs/utils';

import propParser from './services/tool/prop_parser';
import linkplugin from './services/link/linkplugin';
import metaservice from './services/meta/metaservice';
import toolService from './services/tool/tool_service';

import formConstants from './components/form/js/constants';
import formValidationPattern from './components/form/js/validation_pattern';
import controlTypeService from './components/form/js/control_type_service';
import formBase from './components/form/js/form_base';
import commonOperation from './components/meta_operation/js/common_operation';

import  context from "./libs/context";

let MvueCore={
    install:install,
    utils:utils,
    metaBase:metabase,
    metaEntity:metaentity,
    propParser:propParser,
    linkplugin,
    formConstants,
    formValidationPattern,
    formBase,//TODO:后面应该要去掉的
    controlTypeService,
    commonOperation,
    context
};

//Vue插件安装入口函数
function install(Vue, opts = {}) {
    if (install.installed) return;
    context.init(Vue,opts);
    installGridAndForm(Vue);
    Vue.prototype.$metaBase=metabase;
    Vue.prototype.$metaEntity=metaentity;
    Vue.prototype.$metaService=metaservice();
    Vue.prototype.$toolService=toolService();
    Vue.prototype.$http=context.getMvueToolkit().http;
    Vue.prototype.$resource=context.getMvueToolkit().resource;


    MvueCore["session"]=context.getMvueToolkit().session;
    MvueCore["ssoclient"]=context.getMvueToolkit().ssoclient;
    MvueCore["router"]=context.getMvueToolkit().router;
    MvueCore["config"]=context.getMvueToolkit().config;
    MvueCore["http"]=context.getMvueToolkit().http;
    MvueCore["resource"]=context.getMvueToolkit().resource;
};

export default MvueCore;