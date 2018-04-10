
//定义所有容器类型组件，如分组
var types={
    Group:{
        id: "Group", 
        title: "分组", 
        icon:"ivu-icon ivu-icon-navicon-round"
    }
};
//辅助类型的相关组件扩展参数定义
var componentParams={
    Group:{
        width:"100",
        title:"",//分组标题
        description:""//分组描述
    }
};
//判断是否容器组件
function accept(componentType){
    return !!types[componentType];
}
function isGroup(componentType){
    return types.Group.id===componentType;
}
export default{
    types:types,
    componentParams:componentParams,
    accept:accept,
    isGroup:isGroup
}