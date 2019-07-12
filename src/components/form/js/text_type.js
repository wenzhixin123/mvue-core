import _types from './_types';
function limitLength(max){
    return {
        id:'limitLength',
        inputType:_types.inputType.LimitRange,
        default:{
            limit:true,
            max:max,
            min:0
        },
        store:_types.store.MetaFieldInputParams,
        title:'长度限制'
    };
}
//控件属性定义
const props={
    SingleLineText:_types.merge(_types.unique,_types.placeholder,_types.rules,limitLength(200)),
    MultiLineText:_types.merge(_types.unique,_types.placeholder,_types.rules,limitLength(2000),
        {
            id:'rows',
            inputType:_types.inputType.Number,
            default:3,
            store:_types.store.MetaFieldInputParams,
            title:'默认行数'
        },
        {
            id:'autosize',
            inputType:_types.inputType.AutoSize,
            default:{minRows: 3, maxRows: 10},
            store:_types.store.MetaFieldInputParams,
            title:'行自适应设置'
        }
    ),
    Password:_types.merge(_types.placeholder,limitLength(20),
        {
            id:'showBtn',
            inputType:_types.inputType.Boolean,
            default:false,
            store:_types.store.MetaFieldInputParams,
            title:'显示自动生成按钮'
        },
        {
            id:'encrypt',
            inputType:_types.inputType.Boolean,
            default:false,
            store:_types.store.MetaFieldInputParams,
            title:'是否加密'
        }
    ),
    JsonText:_types.merge(_types.placeholder)
};
//文本控件相关定义
var textTypes={
    SingleLineText:{ 
        id: "SingleLineText", 
        title: "单行文本", 
        icon:"md-remove"
    },
    MultiLineText:{ 
        id: "MultiLineText", 
        title: "多行文本", 
        icon:"md-list" 
    },
    Password:{ 
        id: "Password", 
        title: "密文", 
        icon:"ios-eye-off"
    },
    JsonText:{ 
        id: "JsonText", 
        title: "JSON文本", 
        icon:"logo-javascript" 
    }
};
//设置控件属性定义，到控件基础定义上
_.forIn(textTypes,(value,key)=>{
    value.props=props[key];
});
//定义文本类型组件的扩展参数
function textBaseInputRules(componentType){
    return _types.getPropsDefault(props[componentType]);
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