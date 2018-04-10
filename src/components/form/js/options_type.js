const uuidv1 = require('uuid/v1');
import constants from './constants'
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
    CheckboxGroup:{ 
        id: "CheckboxGroup", 
        title: "复选框", 
        icon:"ivu-icon ivu-icon-android-checkbox-outline"
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
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    let rkey=constants.entityModelRedundantKey;
    let titleKey=constants.entityModelTitleKey;
    var $data=(item[rkey]&&item[rkey][fieldName])||{};
    if(metaField.inputTypeParams&&metaField.inputTypeParams.options){
        let optionMap={};
        _.each(metaField.inputTypeParams.options,function(opt){
            optionMap[opt.id]={};
            optionMap[opt.id][titleKey]=opt.text;
        });
        $data=optionMap;
    }
    if(isSingleOption(componentType)){//单选
        let optionText=$data[origin]&&$data[origin][titleKey];
        return optionText||origin;
    }else{
        let optionTexts=[];
        _.each(origin,function(v){
          let optionText=$data[v][titleKey];
          if(!_.isNil(optionText)){
              optionTexts.push(optionText);
          }
        });
        return optionTexts.join(",")||origin.join(",");
    }
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
    fillComponentParams:fillComponentParams
}