const uuidv1 = require('uuid/v1');
import optionsUtils from '../../../libs/metadata/options-utils';

var defaultValue=[
    {id:uuidv1(),text:"选项1",children:[]},
    {id:uuidv1(),text:"选项2",children:[]}
];
var selectTexts=["请选择","请选择","请选择","请选择"];
var types={
    CascadeSelect:{
        id: "CascadeSelect", 
        title: "级联下拉", 
        icon:"ivu-icon ivu-icon-ios-more-outline"
    },
};
var componentParams={
    CascadeSelect:{
        cascadeOptions:{
            options:defaultValue,
            levels:2,
            selectTexts:selectTexts
        }
    }
};
function accept(componentType){
    return !!types[componentType];
}
var newOne=function(){
    return {id:uuidv1(),text:"新选项",children:[]};
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    let optionTexts=optionsUtils.getOptionText(metaField,origin,true);
    return optionTexts.join("/")||origin.join("/");
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
//由swagger.json生成的metaField构造组件参数
function fillComponentParams(formItem,metaField){
    var options=metaField.inputTypeParams["options"];
    if(options){
        formItem.componentParams.cascadeOptions.options=_.cloneDeep(options);
    }
}
export default{
    types:types,
    componentParams:componentParams,
    newOne:newOne,
    defaultValue:defaultValue,
    selectTexts:selectTexts,
    accept:accept,
    formatData:formatData,
    formatDataForExport:formatDataForExport,
    fillComponentParams:fillComponentParams
}