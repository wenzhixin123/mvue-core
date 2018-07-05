//字号控件相关定义
//定义基础组件:字号类型
var issuedNumberTypes={
    IssuedNumber:{
        id: "IssuedNumber",
        title: "发文字号",
        icon:"ivu-icon ivu-icon-ios-list-outline"
    }
};
//定义文本类型组件的扩展参数
function textBaseInputRules(componentType){
    var base={
        placeholder:"",
        unique:false,
        limitLength:{
            limit:false,
            max:200,
            min:0
        },
        validation:{
            validate:false,
            rule:{
                type:"",
                brief:"",
                pattern:""
            }
        }
    };
    return base;
};
var componentParams={
    IssuedNumber:textBaseInputRules(issuedNumberTypes.IssuedNumber.id)
};
//判断是否文本组件
function accept(componentType){
    return !!issuedNumberTypes[componentType];
}
//判断是否单行文本
function isSingleLineText(componentType){
    /*return issuedNumberTypes.SingleLineText.id===componentType;*/
}

export default{
    types:issuedNumberTypes,
    componentParams:componentParams,
    accept:accept,
    isSingleLineText:isSingleLineText
}