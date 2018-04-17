function installGridAndForm(Vue){
    Vue.component('meta-grid-render-html',require("./components/grid/render_html"));
    Vue.component('meta-grid-operation-btn',require("./components/grid/operation_btn"));
    Vue.component('meta-grid-img-title',require("./components/grid/img_title"));
    Vue.component('meta-grid-opts-title',require("./components/grid/opts_title"));
    Vue.component('meta-grid-pictures',require("./components/grid/pictures"));
    Vue.component('meta-grid-files',require("./components/grid/files"));
    Vue.component('meta-grid-import-data',require("./components/grid/import_data.vue"));
    Vue.component('meta-grid',require("./components/grid/iview_grid.vue"));

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

    //begin new added for pclink
    Vue.component('MetaPclinkSingleUserSelect',require("./components/form/pclink/single_user_select"));
    Vue.component('MetaPclinkSingleOrgSelect',require("./components/form/pclink/single_org_select"));
    Vue.component('MetaPclinkMultiUserSelect',require("./components/form/pclink/multi_user_select"));
    Vue.component('MetaPclinkMultiOrgSelect',require("./components/form/pclink/multi_org_select"));
    //end new added for pclink
}
import metabase from './libs/metadata/metabase';
import metaentity from './libs/metadata/metaentity';
import utils from './libs/utils';
import config from './config/config';
import session from './libs/security/session';
import ssoclient from './libs/security/ssoclient';
import ajax from './libs/ajax';
var customValidator = require("./libs/extend/custom_validator.js");
var customVueResource = require("./libs/extend/custom_vue_resource.js");

//可用的mixins
import gridBase from './components/grid/js/entity_grid_base';

import metaservice from "./services/meta/metaservice";
import toolService from "./services/tool/tool_service";

var CustomDirectives = require("./directives/custom_directives");
//Vue插件安装入口函数
const install = function(Vue, opts = {}) {
    installGridAndForm(Vue);
    new CustomDirectives(Vue);
    Vue.prototype.$metaBase=metabase;
    Vue.prototype.$metaEntity=metaentity;
    Vue.prototype.$metaService=metaservice;
    Vue.prototype.$toolService=toolService;
}
let MvueCore={
    install:install,
    mixins:{
        gridBase:gridBase
    },
    utils:utils,
    metaBase:metabase,
    metaEntity:metaentity,
    metaService:metaservice,
    toolService:toolService,
    session:session,
    ssoclient:ssoclient,
    ajax:ajax,
    customValidator:customValidator,
    customVueResource:customVueResource
};
export default MvueCore;