//文本控件相关定义
//定义基础组件:文本类型
var textTypes={
    SingleLineText:{ 
        id: "SingleLineText", 
        title: "单行文本", 
        icon:"ivu-icon ivu-icon-ios-compose-outline"
    },
    MultiLineText:{ 
        id: "MultiLineText", 
        title: "多行文本", 
        icon:"ivu-icon ivu-icon-ios-list-outline" 
    },
    
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
    if(componentType===textTypes.MultiLineText.id){
        base.limitLength.max=2000;
    }
    return base;
};
var componentParams={
    SingleLineText:textBaseInputRules(textTypes.SingleLineText.id),
    MultiLineText:textBaseInputRules(textTypes.MultiLineText.id)
};
//判断是否文本组件
function accept(componentType){
    return !!textTypes[componentType];
}
//判断是否单行文本
function isSingleLineText(componentType){
    return textTypes.SingleLineText.id===componentType;
}

export default{
    types:textTypes,
    componentParams:componentParams,
    accept:accept,
    isSingleLineText:isSingleLineText
}