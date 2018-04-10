const uuidv1 = require('uuid/v1');
//定义基础组件：选项类型
import optionsType from './options_type'
//定义基础组件:文本类型
import textType from './text_type'
//定义基础组件:日期和时间类型
import dateType from './date_type'
//定义基础组件:数字类型基础组件定义
import numberType from './number_type'
//定义基础组件:上传类型基础组件定义
import uploadType from './upload_type';
//定义基础组件:级联下拉组件定义
import cascadeType from './cascade_options_type'
//实体组件：部门用户相关组件定义
import orguserType from './orguser_type'
//实体组件：实体相关组件定义
import entityType from './entity_type'
//基础组件：bool组件定义
import boolType from './bool_type'

//定义所有辅助组件类型，如描述、分隔线等
import auxiliaryType from './auxiliary_type'
var auxiliaryTypes=auxiliaryType.types;

//定义所有容器类型，如分组等
import containerType from './container_type'
var containerTypes=containerType.types;

//所有支持的基础组件
//添加新组件(基础组件)时 step1-1 需要先import再加到这里
var fieldControlsType=[
    textType,
    optionsType,
    dateType,
    numberType,
    uploadType,
    cascadeType,
    boolType
];
var fieldControls=[];
_.each(fieldControlsType,function(type){
    _.each(type.types,function(_t){
        if(!_t.hidden){
            fieldControls.push(_t);
        }
    });
});
//所有支持的数据来源于实体的相关组件
//添加新组件(实体数据组件)时 step1-2 需要先import再加到这里
var entityControlsType=[
    orguserType,
    entityType
];
var entityControls=[];
_.each(entityControlsType,function(type){
    _.each(type.types,function(_t){
        if(!_t.hidden){//用户多选、部门多选默认不显示出来
            entityControls.push(_t);
        }
    });
});
//合并所有非辅助组件，包括基础组件类型、实体组件
var allType=[].concat(fieldControlsType,entityControlsType);
var componentTypes={};
_.each(allType,function(type){
    componentTypes=_.extend(componentTypes,type.types);
});
//所有支持的辅助组件
var auxiliaryControls=[
    auxiliaryTypes.Description,
    auxiliaryTypes.DivisionLine
];
//所有容器类组件
var containerControls=[
    containerTypes.Group
];
//组件布局定义
var componentLayout={
    horizontal:"horizontal",//左右布局
    vertical:"vertical"//上下布局
}
//定义所有基础组件类型的基础参数
var baseComponentParams={
    title:"",//标题，相当于表单label显示文字
    description:"",//描述，相当于input下的提示说明文字
    layout:componentLayout.vertical,//组件的布局方式
    width:"100",//组件所占的宽度，是百分比
    horizontalLayoutLabelWidth:"20",//左右布局时，组件label占的百分比
    required:false//是否必填
};
var fieldIndex=0;
//根据组件类型构造对应的表单布局
function buildFormItemByComponentType(componentType){
    if(!componentType){
        console.log("componentType为空");
        return;
    }
    var formItem={
        id: uuidv1(),
        isDataField:false,
        componentType:componentType
    };
    var componentParams={};
    if(auxiliaryType.accept(componentType)){
        componentParams=_.extend({},auxiliaryType.componentParams[componentType]);
    }else if(containerType.accept(componentType)){
        //容器组件可以放置其它组件，存放在children中
        formItem.children=[];
        formItem.isContainer=true;
        componentParams=_.extend({},containerType.componentParams[componentType]);
    }else{
        formItem.isDataField=true;
        formItem.dataField="field"+fieldIndex++;//如果是field类型，对应实体的字段名
        let accept=false;
        for(let type of allType){
            if(type.accept(componentType)){
                let typeComponentParams=type.componentParams&&type.componentParams[componentType];
                componentParams=_.extend({},baseComponentParams,typeComponentParams||{});
                accept=true;
                break;
            }
        }
        if(!accept){
            componentParams=_.extend({},baseComponentParams);
        }
        componentParams.title=componentTypes[componentType].title;
    }
    formItem.componentParams=componentParams;
    return formItem;
}
//格式化输出组件的数据显示
function formatData(item,metaField){
    let componentType=metaField.inputType;
    let fieldName=metaField.name;
    let initValue=item[fieldName];
    for(let type of allType){
        if(type.accept(componentType)&&type.formatData){
            return type.formatData(componentType,item,metaField);
        }
    }
    return initValue;
}
//定义数据库类型到组件类型的默认映射关系
//添加新组件时 step2 需要添加新组件和数据类型的映射
var columnTypeMapping={
    date:componentTypes.Date.id,
    time:componentTypes.Time.id,
    datetime:componentTypes.DateTime.id,
    timestamp:componentTypes.DateTime.id,
    float:componentTypes.NumberInput.id,
    double:componentTypes.NumberInput.id,
    int:componentTypes.NumberInput.id,
    tinyint:componentTypes.NumberInput.id,
    bigint:componentTypes.NumberInput.id,
    numeric:componentTypes.NumberInput.id,
    decimal:componentTypes.NumberInput.id,
    real:componentTypes.NumberInput.id,
    clob:componentTypes.MultiLineText.id,
    text:componentTypes.MultiLineText.id,
    bit:componentTypes.Boolean.id
};
//获取字段对应的组件类型
function getMetaFieldComponentType(metaField){
    if(metaField.inputType){
        return metaField.inputType;
    }
    var columnType=metaField.columnType;
    var columnLength=metaField.columnLength||0;
    if(columnTypeMapping[columnType]){
        return columnTypeMapping[columnType];
    }
    if(columnType==="varchar") {
        if(columnLength<=200){
            return componentTypes.SingleLineText.id;
        }else if(columnLength>200){
            return componentTypes.MultiLineText.id;
        }
    }
    return componentTypes.SingleLineText.id;
}
//根据实体的所有字段构造默认的表单layout
function buildFormLayoutByMetaFields(metaFields){
    var layout=[];
    _.each(metaFields,function(metaField){
        var componentType=getMetaFieldComponentType(metaField);
        var formItem=buildFormItemByComponentType(componentType);
        formItem.id=metaField.id;
        formItem.dataField=metaField.name;
        formItem.componentParams.title=metaField.title||metaField.name;
        layout.push(formItem);
    });
    return layout;
}
//根据元数据字段构造表单组件所需的模型
function buildFormItemByMetaField(metaField){
    var componentType=getMetaFieldComponentType(metaField);
    var formItem=buildFormItemByComponentType(componentType);
    formItem.id=metaField.id;
    formItem.dataField=metaField.name;
    formItem.componentParams.title=metaField.title||metaField.name;
    //是否必填
    formItem.componentParams.required=metaField.required;
    //是否唯一
    formItem.componentParams.unique=metaField.unique;
    //验证规则
    if(metaField.inputTypeParams["pattern"]){
        formItem.validation={
            validate:true,
            rule:{
                pattern:metaField.inputTypeParams["pattern"]
            }
        };
    }
    //长度规则
    if(metaField.inputTypeParams["maxLength"]||metaField.inputTypeParams["minLength"]){
        formItem.limitLength={
            limit:true,
            max:metaField.inputTypeParams["maxLength"],
            min:metaField.inputTypeParams["minLength"]
        };
    }
    for(let type of allType){
        if(type.accept(componentType)&&type.fillComponentParams){
            type.fillComponentParams(formItem,metaField);
        }
    }
    return formItem;
}
//重新获取下一个字段名
function nextDataFieldName(formItem){
    formItem.dataField="field"+fieldIndex++;
    return formItem;
}
//复制一个组件
function cloneFormItem(formItem){
    let formItemCopy=_.cloneDeep(formItem);
    formItemCopy.id=uuidv1();
    if(!auxiliaryType.accept(formItem.componentType)){//辅助组件和实体字段无关,但基础组件和实体字段相关
        formItemCopy.dataField="field"+fieldIndex++;
    }
    return formItemCopy;
}
//从一个组件切换到另一个兼容组件
function toggleComponent(formItem,newComponentType){
    var newFormItem=buildFormItemByComponentType(newComponentType);
    //暂时只保留id和字段名一致
    newFormItem.id=formItem.id;
    newFormItem.dataField=formItem.dataField;
    return newFormItem;
};
//获取formItem对应组件兼容的组件集合，不存在时返回false
function switchableComponents(formItem){
    var componentType=formItem.componentType;
    for(let type of allType){
        if(type.accept(componentType)&&type.switchableComponents){
            return type.switchableComponents(componentType);
        }
    }
    return false;
};

export default{
    componentTypes:componentTypes,
    switchableComponents:switchableComponents,
    toggleComponent:toggleComponent,
    buildFormItemByComponentType:buildFormItemByComponentType,
    buildOptionsItem:optionsType.buildOptionsItem,
    nextDataFieldName:nextDataFieldName,
    fieldControls:fieldControls,
    auxiliaryControls:auxiliaryControls,
    entityControls:entityControls,
    containerControls:containerControls,
    cloneFormItem:cloneFormItem,
    isText:textType.accept,
    isSingleLineText:textType.isSingleLineText,
    isOptions:optionsType.accept,
    isSingleOption:optionsType.isSingleOption,
    isSingleSelect:optionsType.isSingleSelect,
    isAuxiliary:auxiliaryType.accept,
    isDescription:auxiliaryType.isDescription,
    isDivisionLine:auxiliaryType.isDivisionLine,
    isDate:dateType.isDate,
    isTime:dateType.isTime,
    isDateTime:dateType.isDateTime,
    isDateOrTime:dateType.accept,
    isDigits:numberType.accept,
    isUpload:uploadType.accept,
    isPictureUpload:uploadType.isPictureUpload,
    isFileUpload:uploadType.isFileUpload,
    isOrguserType:orguserType.accept,
    isCascadeType:cascadeType.accept,
    isRefEntityType:entityType.accept,
    isContainer:containerType.accept,
    componentLayout:componentLayout,
    datePrecision:dateType.datePrecision,
    timePrecision:dateType.timePrecision,
    uploadFilters:uploadType.uploadFilters,
    controlMode:{normal:"normal",design:"design"},////["design","normal"],design设计模式，组件不可操作;normal普通模式，可以填写数据
    buildFormLayoutByMetaFields:buildFormLayoutByMetaFields,
    buildFormItemByMetaField:buildFormItemByMetaField,
    formatData:formatData,
    getMetaFieldComponentType:getMetaFieldComponentType
};
