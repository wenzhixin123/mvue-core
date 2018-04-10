import constants from './constants'
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
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    let rkey=constants.entityModelRedundantKey;
    let titleKey=constants.entityModelTitleKey;
    var $data=(item[rkey]&&item[rkey][fieldName])||{};
    var result="";
    //单选
    if(orgUserTypes.SingleUserSelect.id===componentType||orgUserTypes.SingleOrgSelect.id===componentType){
        result= $data[origin]&&$data[origin][titleKey];
        result=result||origin;
    }else if(orgUserTypes.MultiUserSelect.id===componentType||orgUserTypes.MultiOrgSelect.id===componentType){
    //多选
        let names=[];
        _.each(origin,function(id){
            let name=$data[id]&&$data[id][titleKey];
            name=name||id;
            names.push(name);
        });
        result= names.join(",");
    }
    return result;
}
export default{
    types:orgUserTypes,
    accept:accept,
    switchableComponents:switchableComponents,
    formatData:formatData
}