//字号控件相关定义
//定义基础组件:字号类型
const uuidv1 = require('uuid/v1');
var issuedNumberTypes={
    IssuedNumber:{
        id: "IssuedNumber",
        title: "发文字号",
        icon:"ios-albums-outline"
    }
};
//定义文本类型组件的扩展参数
function textBaseInputRules(componentType){
    var base={
        placeholder:"",
        unique:false,
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
//构建一个新的选项
function buildOptionsItem(){
    return {id:uuidv1(),text:"新选项",checked:false};
};
//标准一：发文机关代字（手填）＋年份＋发文顺序号    如xxx［2012］10号
//标准二：发文机关代字（可选）＋年份＋发文顺序号    如 中林实业［2018］1号
var standard={
    standard1:"standard1",
    standard2:"standard2"
};
function baseOptions(){
    return [
        {id:uuidv1(),text:"选项1",checked:false},
        {id:uuidv1(),text:"选项2",checked:false},
        {id:uuidv1(),text:"选项3",checked:false}
    ];
}
//定义选项类型组件的扩展参数
var optionsBaseInputRules={
    options:baseOptions(),
    otherOptions:{
        addOthers:false,
        id:"_others",
        text:"其他",
        required:false
    }
};
var componentParams={
    IssuedNumber:textBaseInputRules(issuedNumberTypes.IssuedNumber.id),
    RadioButton:{
        options:baseOptions(),
        otherOptions:{
            addOthers:false,
            id:"_others",
            text:"其他",
            required:false
        }
    },
    SingleSelect:{
        options:baseOptions(),
        selectText:"请选择"
    },
    CheckboxGroup:{
        options:baseOptions(),
        otherOptions:{
            addOthers:false,
            id:"_others",
            text:"其他",
            required:false
        }
    }
};
//判断是否文本组件
function accept(componentType){
    return !!issuedNumberTypes[componentType];
}
//判断是否
function isIssuedNumber(componentType){
    return issuedNumberTypes.IssuedNumber.id===componentType;
}

export default{
    types:issuedNumberTypes,
    componentParams:componentParams,
    accept:accept,
    isIssuedNumber:isIssuedNumber,
    standard:standard,
    buildOptionsItem:buildOptionsItem
}