var filesize = require('file-size');
//定义基础组件:数字类型基础组件定义
var numberTypes={
    NumberInput:{//过时的，先隐藏
        id: "NumberInput", 
        title: "数字", 
        icon:"ivu-icon ivu-icon-ios-compose-outline",
        hidden:true 
    },
    Number:{ 
        id: "Number", 
        title: "数字", 
        icon:"ivu-icon ivu-icon-ios-compose-outline"
    },
    AdvNumber:{//仅在高级查询表单使用，隐藏 
        id: "AdvNumber", 
        title: "数字", 
        icon:"ivu-icon ivu-icon-ios-compose-outline",
        hidden:true 
    }
};
let baseParams={
    limitRange:{
        limit:false,//是否限制数据范围
        max:null,//最大值
        min:0//最小值
    },
    decimal:{
        isAllowed:false,//是否允许小数
        digits:2//小数位数
    },
    allowNegative:true,//是否允许负数
    formatter:"",
    unit:""//TODO 单位，显示的单位
};
//数值类型组件的扩展参数
var componentParams={
    NumberInput:_.cloneDeep(baseParams),
    Number:_.cloneDeep(baseParams),
    AdvNumber:_.cloneDeep(baseParams)
};
const formatters={
    bytes:{
        format(bytesSize){
            return filesize(bytesSize).human('jedec');
        }
    }
}
//判断是否数值类型组件
function accept(componentType){
    return !!numberTypes[componentType];
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    if(metaField.inputTypeParams&&metaField.inputTypeParams.formatter){
        let fs=formatters[metaField.inputTypeParams.formatter];
        if(fs){
            return fs.format(origin);
        }
    }
    return origin;
}
export default{
    types:numberTypes,
    componentParams:componentParams,
    accept:accept,
    formatData:formatData,
    formatters
}