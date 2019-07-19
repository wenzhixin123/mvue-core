import _types from './_types';
var types={
    Tag:{ 
        id: "Tag", 
        title: "标签", 
        icon:"ivu-icon ivu-icon-md-radio-button-off",
        props:_types.merge(_types.placeholder,_types.rules) 
    }
};
var componentParams={
    Tag:_types.getPropsDefault(types.Tag.props)
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
    return origin.join(',');
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
export default{
    types,
    componentParams,
    accept,
    formatData,
    formatDataForExport
}