const uuidv1 = require('uuid/v1');
import optionsUtils from '../../../libs/metadata/options-utils';
//定义基础组件：选项类型
var optionsTypes={
    RadioButton:{ 
        id: "RadioButton", 
        title: "单选按钮组", 
        icon:"ivu-icon ivu-icon-ios-circle-filled"
    },
    SingleSelect:{ 
        id: "SingleSelect", 
        title: "单选下拉框", 
        icon:"ivu-icon ivu-icon-arrow-down-b"
    },
    MultiSelect:{ 
        id: "MultiSelect", 
        title: "多选下拉框",
        icon:"ivu-icon ivu-icon-ios-checkmark-circle-outline"
    },
    CheckboxGroup:{ 
        id: "CheckboxGroup", 
        title: "复选框", 
        icon:"ivu-icon ivu-icon-android-checkbox-outline"
    },
    BitCode:{
        id: "BitCode",
        title: "权限集",
        icon:"ivu-icon ivu-icon-ios-checkbox-outline"
    }
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
    MultiSelect:{
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
    },
    BitCode:{
        options:[]
    }
};
//构建一个新的选项
function buildOptionsItem(){
    return {id:uuidv1(),text:"新选项",checked:false};
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
    buildOptionsItem:buildOptionsItem,
    accept:accept,
    isSingleSelect:isSingleSelect,
    isSingleOption:isSingleOption,
    formatData:formatData,
    formatDataForExport,
    fillComponentParams:fillComponentParams,
    toDiscreteValue:toDiscreteValue
}