//字号控件相关定义
import _types from './_types';
//定义基础组件:字号类型
const agencyOptionsProp={
    id:'agencyOptions',
    inputType:_types.inputType.Json,
    default:[],
    store:_types.store.MetaFieldInputParams,
    title:'可选机关代字'
}
var issuedNumberTypes={
    IssuedNumber:{
        id: "IssuedNumber",
        title: "发文字号",
        icon:"ios-albums-outline",
        props:_types.merge(agencyOptionsProp) 
    }
};
//标准一：发文机关代字（手填）＋年份＋发文顺序号    如xxx［2012］10号
//标准二：发文机关代字（可选）＋年份＋发文顺序号    如 中林实业［2018］1号
var componentParams={
    IssuedNumber:_types.getPropsDefault(issuedNumberTypes.IssuedNumber.props)
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
    isIssuedNumber:isIssuedNumber
}