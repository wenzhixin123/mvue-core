import _types from './_types';
var types={
    Boolean:{ 
        id: "Boolean", 
        title: "布尔值", 
        icon:"md-checkbox",
        props:_types.merge()
    }
};
var componentParams={
    Boolean:_types.getPropsDefault(types.Boolean.props)
};
function accept(componentType){
    return !!types[componentType];
}
function formatData(componentType,item,metaField){
    // let fieldName=metaField.name;
    // let origin=item[fieldName];
    // if(_.isUndefined(origin)||_.isNull(origin)||origin===''){
    //     return "";
    // }
    // return `<input ${origin?'checked':''} disabled="disabled" type="checkbox">`;
    return formatDataForExport(componentType,item,metaField);
}
function formatDataForExport(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isUndefined(origin)||_.isNull(origin)||origin===''){
        return "";
    }
    return origin?'是':'否';
}
export default{
    types:types,
    accept:accept,
    componentParams:componentParams,
    formatData:formatData,
    formatDataForExport:formatDataForExport
}