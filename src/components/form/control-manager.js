import controlTypeService from './js/control_type_service';
import controlBase from './js/control_base';
import context from '../../libs/context'
function registerSingle(controlDef){
    //注册表单字段组件到controlTypeService
    controlTypeService.registerFieldControls(controlDef);
    //注册表单字段组件到Vue全局
    var types=controlDef.types;
    Object.keys(types).forEach(key => {
        let name=`m-${_.kebabCase(key)}`;
        let VueDef=context.getVue();
        if(types[key].component){
            VueDef.component(name,types[key].component);
        }
    });
}
//注册自定义的表单控件
function register(controlDef){
    if(!controlDef){
        return;
    }
    if(_.isArray(controlDef)){
        _.forEach(controlDef,(ctr)=>{
            registerSingle(ctr);
        });
    }else{
        registerSingle(controlDef);
    }
}
//合并设计器模式的表单控件定义
function mergeDesignerDef(designerDef){
    if(!designerDef){
        return;
    }
    controlTypeService.mergeFieldControlDesignerDef(designerDef);
}
export default {
    mergeDesignerDef,
    register:register,
    controlBase:controlBase
}