import optionsUtils from '../../../libs/metadata/options-utils';
import _types from './_types';

const showOthersProp={
    id:'showOthers',
    inputType:_types.inputType.Boolean,
    default:false,
    store:_types.store.MetaFieldInputParams,
    title:'显示[其他]'
};
const othersTextProp={
    id:'othersText',
    inputType:_types.inputType.SingleLineText,
    default:optionsUtils.othersText,
    store:_types.store.MetaFieldInputParams,
    title:'[其他]文字说明'
};
//控制自填输入框可输入的字符串个数
const othersInputMaxProp={
    id:'othersInputMax',
    inputType:_types.inputType.Number,
    default:20,
    min:1,
    store:_types.store.MetaFieldInputParams,
    title:'[其他]文字长度限制'
};
const placeholderProp=Object.assign({},_types.placeholder,{default:'请选择',title:'选择框默认文字'});
let props={
    RadioButton:_types.merge(_types.options,showOthersProp,othersTextProp,othersInputMaxProp),
    SingleSelect:_types.merge(_types.options,placeholderProp),
    MultiSelect:_types.merge(_types.options,placeholderProp),
    CheckboxGroup:_types.merge(_types.options,showOthersProp,othersTextProp,othersInputMaxProp),
    BitCode:_types.merge(_types.options)
};
//定义基础组件：选项类型
var optionsTypes={
    RadioButton:{ 
        id: "RadioButton", 
        title: "单选按钮组", 
        icon:"md-radio-button-on"
    },
    SingleSelect:{ 
        id: "SingleSelect", 
        title: "单选下拉框", 
        icon:"md-arrow-dropdown"
    },
    MultiSelect:{ 
        id: "MultiSelect", 
        title: "多选下拉框",
        icon:"md-arrow-dropdown-circle"
    },
    CheckboxGroup:{ 
        id: "CheckboxGroup", 
        title: "复选框", 
        icon:"ios-checkbox-outline"
    },
    BitCode:{
        id: "BitCode",
        title: "二进制编码",
        icon:"md-disc"
    }
};
//设置控件属性定义，到控件基础定义上
_.forIn(optionsTypes,(value,key)=>{
    value.props=props[key];
});
function buildPropsDefault(componentType){
    let params= _types.getPropsDefault(props[componentType]);
    //属性定义options是字符串，存的是选项级的名字；实际表单控件是展开的options数组，所以这里做个转换
    params.options=[];
};
//定义选项类型组件的扩展参数
var componentParams={
    RadioButton:buildPropsDefault(optionsTypes.RadioButton.id),
    SingleSelect:buildPropsDefault(optionsTypes.SingleSelect.id),
    MultiSelect:buildPropsDefault(optionsTypes.MultiSelect.id),
    CheckboxGroup:buildPropsDefault(optionsTypes.CheckboxGroup.id),
    BitCode:buildPropsDefault(optionsTypes.BitCode.id)
};
//判断是否选项类型
function accept(componentType){
    return !!optionsTypes[componentType];
}
//判断是否单选下拉框
function isSingleSelect(componentType){
    return componentType===optionsTypes.SingleSelect.id;
}
//判断是否为单选项
function isSingleOption(componentType){
    return componentType===optionsTypes.RadioButton.id
    ||componentType===optionsTypes.SingleSelect.id;
}
function toDiscreteValue(v){//255 ->1 2 4 8 16 32 64 128
    var r=[];
    if(v<=0){
        return r;
    }
    var binaryString=v.toString(2);
    var len=binaryString.length;
    for(let i=0;i<len;++i){
        let b=binaryString.charAt(i);
        if(b==="1"){
            r.push(Math.pow(2,len-1-i).toString());
        }
    }
    return r;
}
//判断是否是二进制码
function isBitCode(componentType){
    return componentType===optionsTypes.BitCode.id;
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    //权限集，先将权限集对应的整数分解成权限值数组
    if(isBitCode(componentType)){
        origin=toDiscreteValue(origin);
    }
    let optionText=optionsUtils.getOptionText(metaField,origin);
    if(isSingleOption(componentType)){//单选
        return optionText;
    }else{
        return optionText&&optionText.join(",");
    }
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
//由swagger.json生成的metaField构造组件参数
function fillComponentParams(formItem,metaField){
    var options=metaField.inputTypeParams["options"];
    if(options){
        formItem.componentParams.options=_.cloneDeep(options);
    }
}
export default{
    types:optionsTypes,
    componentParams:componentParams,
    accept:accept,
    isSingleSelect:isSingleSelect,
    isSingleOption:isSingleOption,
    formatData:formatData,
    formatDataForExport,
    fillComponentParams:fillComponentParams,
    toDiscreteValue:toDiscreteValue
}