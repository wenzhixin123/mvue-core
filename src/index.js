import tabs from './components/tabs/index';
import section from './components/section/index';
import text from './components/text/index';

import gridRenderHtml from './components/grid/column-render/render_html';
import gridOperationBtn from './components/grid/column-render/operation_btn';
import gridImgTitle from './components/grid/column-render/img_title';
import gridOptsTitle from './components/grid/column-render/opts_title';
import gridLinkTitle from './components/grid/column-render/link_title';
import gridPictures from './components/grid/column-render/pictures';
import gridFiles from './components/grid/column-render/files';
import gridPassword from './components/grid/column-render/password';
import gridRelationField from './components/grid/column-render/relation-field';
import gridRowStatus from './components/grid/column-render/row-status';
import gridImportData from './components/grid/import_data.vue';
import batchEditorFillData from './components/batch-editor/fill-data';

import operation from './components/meta_operation/operation';

import grid from './components/grid/iview_grid.vue';
import entityTree from './components/entity-tree/index';
import treeGrid from './components/meta-tree-grid/index';
import vgrid from './components/v-grid/index';
import vform from './components/v-form/index';
import layout from './components/meta-layout/index';
import page from './components/meta-page/index';
import mfield from './components/form/metafield';
import mform from './components/form/metaform';
import detailView from "./components/detail-view/index";
import batchEditor from "./components/batch-editor/index";

import Description from './components/form/control_tmpl/description';
import DivisionLine from './components/form/control_tmpl/division_line';
import Group from './components/form/control_tmpl/group'

import SingleLineText from './components/form/control_tmpl/single_line_text';
import MultiLineText from './components/form/control_tmpl/multi_line_text';
import RadioButton from './components/form/control_tmpl/radio_button';
import CheckboxGroup from './components/form/control_tmpl/checkbox_group';
import SingleSelect from './components/form/control_tmpl/single_select';
import MultiSelect from './components/form/control_tmpl/multi-select';
import Date from './components/form/control_tmpl/date';
import Time from './components/form/control_tmpl/time';
import DateTime from './components/form/control_tmpl/datetime';

import DateRange from './components/form/control_tmpl/daterange';
import TimeRange from './components/form/control_tmpl/timerange';
import DateTimeRange from './components/form/control_tmpl/datetimerange';

import NumberInput from './components/form/control_tmpl/number_input';
import FileUpload from './components/form/control_tmpl/file_upload';
import PictureUpload from './components/form/control_tmpl/picture_upload';
import Portrait from './components/form/control_tmpl/portrait';
import SingleFileUpload from './components/form/control_tmpl/single-file-upload';
import SingleImageUpload from './components/form/control_tmpl/single-image-upload';
import SingleUserSelect from './components/form/control_tmpl/single_user_select';
import SingleOrgSelect from './components/form/control_tmpl/single_org_select';
import MultiUserSelect from './components/form/control_tmpl/multi_user_select';
import MultiOrgSelect from './components/form/control_tmpl/multi_org_select';
import CascadeSelect from './components/form/control_tmpl/cascade_select';

import RefEntity from './components/form/control_tmpl/ref_entity';
import MultiRefEntity from './components/form/control_tmpl/multi_ref_entity';
import ParentSelect from './components/form/control_tmpl/parent-select/index';

import Boolean from './components/form/control_tmpl/boolean';
import IssuedNumber from './components/form/control_tmpl/issued_number';
import BitCode from './components/form/control_tmpl/bit-code';
import Password from './components/form/control_tmpl/password';
import mExpand from './components/form/control_tmpl/expand/index';
import mConfirm from './components/form/control_tmpl/confirm/index';
import mRelation from './components/form/control_tmpl/relation/index';

//link特殊打开的组件
import PclinkSingleUserSelect from './components/form/pclink/single_user_select';
import PclinkSingleOrgSelect from './components/form/pclink/single_org_select';
import PclinkMultiUserSelect from './components/form/pclink/multi_user_select';
import PclinkMultiOrgSelect from './components/form/pclink/multi_org_select';
import simpleTree from './components/simple-tree/tree';

const formComponents={
    Description,
    DivisionLine,
    Group,
    SingleLineText,
    MultiLineText,
    RadioButton,
    CheckboxGroup,
    SingleSelect,
    MultiSelect,
    Date,
    Time,
    DateTime,

    DateRange,
    TimeRange,
    DateTimeRange,

    NumberInput,
    Number:NumberInput,

    FileUpload,
    MultiFileUpload:FileUpload,
    SingleFileUpload,

    PictureUpload,
    MultiImageUpload:PictureUpload,
    SingleImageUpload,

    Portrait,
    Avatar:Portrait,

    SingleUserSelect,
    SingleOrgSelect,
    MultiUserSelect,
    MultiOrgSelect,
    CascadeSelect,
    RefEntity,
    MultiRefEntity,
    ParentSelect,
    Boolean,
    IssuedNumber,
    BitCode,
    Password,

    PclinkSingleUserSelect,
    PclinkSingleOrgSelect,
    PclinkMultiUserSelect,
    PclinkMultiOrgSelect
};
const gridInnerComponents={
    'm-grid-render-html':gridRenderHtml,
    'm-grid-operation-btn':gridOperationBtn,
    'm-grid-img-title':gridImgTitle,
    'm-grid-opts-title':gridOptsTitle,
    'm-grid-link-title':gridLinkTitle,
    'm-grid-pictures':gridPictures,
    'm-grid-files':gridFiles,
    'm-grid-password':gridPassword,
    'm-grid-relation-field':gridRelationField,
    'm-grid-row-status':gridRowStatus,
    'm-grid-import-data':gridImportData,
    'm-batch-editor-fill-data':batchEditorFillData,
    'meta-operation':operation,
    'm-operation':operation
};
//旧的组件定义，文档中会废除
const oldFasionComponents={
    'b-tabs':tabs,
    'b-section':section,
    'b-text':text,
    'meta-field':mfield,
    'meta-form':mform,
    'meta-grid':grid,
    'meta-entity-tree':entityTree,
    'meta-tree-grid':treeGrid,
    'meta-v-grid':vgrid,
    'meta-v-form':vform,
    'meta-layout':layout,
    'meta-page':page,
};
//新对外暴露的组件，文档会以这里的组件为准
const mComponents={
    'm-tabs':tabs,
    'm-section':section,
    'm-text':text,
    'm-field':mfield,
    'm-form':mform,
    'm-grid':grid,
    'm-entity-tree':entityTree,
    'm-tree-grid':treeGrid,
    'm-v-grid':vgrid,
    'm-v-form':vform,
    'm-layout':layout,
    'm-page':page,
    'm-simple-tree':simpleTree,
    'm-expand':mExpand,
    'm-confirm':mConfirm,
    'm-detail-view':detailView,
    'm-relation':mRelation,
    'm-batch-editor':batchEditor
};
const allComponents=_.extend({},gridInnerComponents,oldFasionComponents,mComponents);
//全局组件样式在这里引入，避免在内部重复引用
require('./components/components.less');
import metabase from './libs/metadata/metabase';

import propParser from './services/tool/prop_parser';
import linkplugin from './services/link/linkplugin';
import metaservice from './services/meta/metaservice';
import toolService from './services/tool/tool_service';
import treeService from './services/tool/tree-service';
import metaLayoutConvertor from './components/meta-layout/layout-convertor';

import formConstants from './components/form/js/constants';
import formValidationPattern from './components/form/js/validation_pattern';
import controlTypeService from './components/form/js/control_type_service';
import commonOperation from './components/meta_operation/js/common_operation';

import  context from "./libs/context";
import getParent from './components/mixins/get-parent';
import operationManager from "./libs/operation/operations";
import formControlManager from './components/form/control-manager';
import topEntityService from "./services/store/top-entity";

let MvueCore={
    install:install,
    metaBase:metabase,
    propParser:propParser,
    linkplugin,
    formConstants,
    formValidationPattern,
    controlTypeService,
    operationManager:operationManager,
    context,
    metaLayoutConvertor,
    getParent,
    treeService,
    formControlManager,
    initAfterAppCtxCreated:(appCtx)=>{
        context.initAfterAppCtxCreated(appCtx);
    },
    initAfterAppStarted:(appCtx)=>{
        context.initAfterAppStarted(appCtx);
    },
    addRouterInterceptor:(router,{appCtx})=>{
        if(router&&appCtx&&appCtx.getStore){
            router.beforeEach(function(to, from, next) {
                let store=appCtx.getStore();
                if(store){
                    //每次进到路由时先清空当前路由的状态数据
                    store.commit('core/clearCurrentRouteData');
                    //访问模式参数附加
                    if(to.query["x_access_mode"]){
                        store.commit('core/setAccessMode',to.query["x_access_mode"]);
                    }
                    //多租户过滤参数附加
                    if(to.query["x_top_entity_row"]){
                        topEntityService.setByString(to.query["x_top_entity_row"]);
                    }
                }
                next();
            });
        }
    }
};

//Vue插件安装入口函数
function install(Vue, opts = {}) {
    if (install.installed) return;
    context.init(Vue,opts);
    
    //注册组件到vue
    Object.keys(allComponents).forEach(key => {
        Vue.component(key, allComponents[key]);
    });
    //注册表单字段组件到vue
    Object.keys(formComponents).forEach(key => {
        let name=`m-${_.kebabCase(key)}`;
        Vue.component(name,formComponents[key]);
    });
    Vue.prototype.$metaBase=metabase;
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