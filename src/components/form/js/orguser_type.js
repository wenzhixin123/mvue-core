import entityType from './entity_type';
var orgUserTypes={
    SingleUserSelect:{ 
        id: "SingleUserSelect", 
        title: "用户选择", 
        icon:"ivu-icon ivu-icon-ios-people"
    },
    SingleOrgSelect:{ 
        id: "SingleOrgSelect", 
        title: "部门选择", 
        icon:"ivu-icon ivu-icon-network" 
    },
    MultiUserSelect:{ 
        id: "MultiUserSelect", 
        title: "用户多选", 
        icon:"ivu-icon ivu-icon-ios-people",
        hidden:true
    },
    MultiOrgSelect:{ 
        id: "MultiOrgSelect", 
        title: "部门多选", 
        icon:"ivu-icon ivu-icon-network",
        hidden:true 
    }
};
var orgUserComponentParams={
    SingleUserSelect:{
    },
    SingleOrgSelect:{
    },
    MultiUserSelect:{
    },
    MultiOrgSelect:{
    }
};
function accept(componentType){
    return !!orgUserTypes[componentType];
}
//componentType对应的可切换的组件集合
function switchableComponents(componentType){
    if(orgUserTypes.SingleUserSelect.id===componentType){
        return [
            {
                id:orgUserTypes.MultiUserSelect.id,
                title:'用户多选'
            }
        ];
    }else if(orgUserTypes.MultiUserSelect.id===componentType){
        return [
            {
                id:orgUserTypes.SingleUserSelect.id,
                title:'用户单选'
            }
        ];
    }else if(orgUserTypes.SingleOrgSelect.id===componentType){
        return [
            {
                id:orgUserTypes.MultiOrgSelect.id,
                title:'部门多选'
            }
        ];
    }else if(orgUserTypes.MultiOrgSelect.id===componentType){
        return [
            {
                id:orgUserTypes.SingleOrgSelect.id,
                title:'部门单选'
            }
        ];
    }
    return false;
}
function formatData(componentType,item,metaField){
    return entityType.formatData(componentType,item,metaField);
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
export default{
    types:orgUserTypes,
    accept:accept,
    switchableComponents:switchableComponents,
    formatData:formatData,
    formatDataForExport
}