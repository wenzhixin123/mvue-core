
//定义所有辅助组件类型，如描述、分隔线等
var auxiliaryTypes={
    Description:{
        id: "Description", 
        title: "文本描述", 
        icon:"ivu-icon ivu-icon-document-text"
    },
    DivisionLine:{
        id: "DivisionLine", 
        title: "分割线", 
        icon:"ivu-icon ivu-icon-minus"
    }
};
//辅助类型的相关组件扩展参数定义
var componentParams={
    Description:{
        width:"100",
        content:"文字内容",
        align:"left"
    },
    DivisionLine:{
        width:"100",
        title:"",
        description:"",
        titleAlign:"left",
        descriptionAlign:"left",
    },
};
//判断是否辅助组件，辅助组件只存在于界面，和实体字段无关
function accept(componentType){
    return !!auxiliaryTypes[componentType];
}
//判断是否文本描述辅助组件
function isDescription(componentType){
    return componentType===auxiliaryTypes.Description.id;
}
//判断是否分割线辅助组件
function isDivisionLine(componentType){
    return componentType===auxiliaryTypes.DivisionLine.id;
}
export default{
    types:auxiliaryTypes,
    componentParams:componentParams,
    accept:accept,
    isDescription:isDescription,
    isDivisionLine:isDivisionLine
}