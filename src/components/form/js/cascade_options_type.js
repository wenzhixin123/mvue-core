/**
 * 表单级联控件使用场景：
 * 1：字段定义指定了options的，通过固定的选项渲染
 *    "dataType":"array"
 *    "options":"address"
 *
 * 2：多对一关系字段，例如[应用]的[所属网关]，关系实体是[网关]，选取[所属网关]时，需要在[区域]下选择[网关]
 *    "inputParams":{
 *      "parentField":"regionId"
 *    } 
 * 3：多对一关系字段，例如[用户]的[所属部门]，关系实体是[部门]，选取[所属部门]时，需要在父级[部门]下选择[部门]
 *    "inputParams":{
 *      "parentField":"parentId"
 *    }
 *
 */
import optionsUtils from '../../../libs/metadata/options-utils';
import entityType from './entity_type';
import _types from './_types';
const parentFieldProp={
    id:'parentField',
    inputType:_types.inputType.RefEntityField,
    default:'',
    store:_types.store.MetaFieldInputParams,
    title:'引用实体的分类字段'
}
var types={
    CascadeSelect:{
        id: "CascadeSelect", 
        title: "级联下拉", 
        icon:"ios-more-outline",
        props:_types.merge(
            _types.placeholder,
            _types.options,
            Object.assign({},_types.manyToOneRelation,{required:false}),
            parentFieldProp,
             _types.queryOptions,
            Object.assign({},_types.queryOptions,{id:'parentQueryOptions',title:'分类实体的查询条件'})
        )
    }
};
var componentParams={
    CascadeSelect:_types.getPropsDefault(types.CascadeSelect.props)
};
function accept(componentType){
    return !!types[componentType];
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    if(isLocalOptions(metaField)){//选项类型
        let optionTexts=optionsUtils.getOptionText(metaField,origin,true);
        return optionTexts.join("/")||origin.join("/");
    }else{
        //这里因为formatData不需要componentType这个参数，所以不传也可以，这里作为标志，还是传递进去
        return entityType.formatData(componentType,item,metaField);
    }
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
function isLocalOptions(metaField){
    var options=metaField.inputTypeParams["options"];
    return !_.isEmpty(options);
}
//由swagger.json生成的metaField构造组件参数
function fillComponentParams(formItem,metaField){
    if(isLocalOptions(metaField)){//选项类型
        let options=metaField.inputTypeParams["options"];
        formItem.componentParams.cascadeOptions={
            options:_.cloneDeep(options)
        };
    }else{//多对一关系类型
        entityType.fillComponentParams(formItem,metaField);
    }
}
export default{
    types:types,
    componentParams:componentParams,
    accept:accept,
    formatData:formatData,
    formatDataForExport:formatDataForExport,
    fillComponentParams:fillComponentParams
}