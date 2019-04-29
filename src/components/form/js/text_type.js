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
    Password:{ 
        id: "Password", 
        title: "密文", 
        icon:"ivu-icon ivu-icon-ios-lock-outline"
    },
    JsonText:{ 
        id: "JsonText", 
        title: "JSON文本", 
        icon:"ivu-icon ivu-icon-logo-javascript" 
    }
};
//定义文本类型组件的扩展参数
function textBaseInputRules(componentType){
    var base={
        placeholder:"",
        unique:false,
        limitLength:{
            limit:true,
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
        base.rows=3;//默认三行
        base.autosize={minRows: 3, maxRows: 10 };
    }
    if(componentType===textTypes.Password.id){
        base.limitLength.max=20;
        base.showBtn=false;
        base.encrypt=false;//表示后端是否会加密，此时前端表单不会提交密码到后端，必须通过特殊的接口修改密码
    }
    return base;
};
var componentParams={
    SingleLineText:textBaseInputRules(textTypes.SingleLineText.id),
    MultiLineText:textBaseInputRules(textTypes.MultiLineText.id),
    Password:textBaseInputRules(textTypes.Password.id),
    JsonText:textBaseInputRules(textTypes.JsonText.id)
};
//判断是否文本组件
function accept(componentType){
    return !!textTypes[componentType];
}
//判断是否单行文本
function isSingleLineText(componentType){
    return textTypes.SingleLineText.id===componentType;
}
//判断是否多行文本
function isMultiLineText(componentType){
    return textTypes.MultiLineText.id===componentType;
}
//判断是否密文
function isPassword(componentType){
    return textTypes.Password.id===componentType;
}

export default{
    types:textTypes,
    componentParams:componentParams,
    accept:accept,
    isSingleLineText:isSingleLineText,
    isMultiLineText,
    isPassword
}