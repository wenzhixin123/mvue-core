import constants from './constants';
var types={
    MemberSelect:{ 
        id: "MemberSelect", 
        title: "成员", 
        icon:"ivu-icon ivu-icon-person-add",
        hidden:true 
    }
};
var componentParams={
    MemberSelect:{
    }
};
function accept(componentType){
    return !!types[componentType];
}

function formatData(componentType,item,metaField){
    return "";
}

export default{
    types:types,
    accept:accept,
    formatData:formatData,
    componentParams:componentParams
}