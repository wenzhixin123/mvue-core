var types={
    Boolean:{ 
        id: "Boolean", 
        title: "布尔值", 
        icon:"ivu-icon ivu-icon-android-checkbox"
    }
};
var componentParams={
    Boolean:{
        
    }
};
function accept(componentType){
    return !!types[componentType];
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isUndefined(origin)||_.isNull(origin)||origin===''){
        return "";
    }
    return `<input ${origin?'checked':''} disabled="disabled" type="checkbox">`;
}
export default{
    types:types,
    accept:accept,
    componentParams:componentParams,
    formatData:formatData
}