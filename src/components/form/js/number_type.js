var filesize = require('file-size');
import _types from './_types';
let props=[
    {
        id:'limitRange',
        inputType:_types.inputType.LimitRange,
        default:{
            limit:false,//是否限制数据范围
            max:null,//最大值
            min:0//最小值
        },
        store:_types.store.MetaFieldInputParams,
        title:'限制数据范围'
    },
    {
        id:'decimal',
        inputType:_types.inputType.Decimal,
        default:{
            isAllowed:false,//是否允许小数
            digits:2//小数位数
        },
        store:_types.store.MetaFieldInputParams,
        title:'允许小数'
    },
    {
        id:'allowNegative',
        inputType:_types.inputType.Boolean,
        default:true,
        store:_types.store.MetaFieldInputParams,
        title:'允许负数'
    },
    {
        id:'formatter',
        inputType:_types.inputType.SingleSelect,
        options:[
            {value:'',title:'无'},
            {value:'bytes',title:'字节转换'}
        ],
        default:'',
        store:_types.store.MetaFieldInputParams,
        title:'格式'
    }
];
//定义基础组件:数字类型基础组件定义
var numberTypes={
    NumberInput:{//过时的，先隐藏
        id: "NumberInput", 
        title: "数字", 
        hidden:true ,
        props:_types.merge(_types.placeholder,...props)
    },
    Number:{ 
        id: "Number", 
        title: "数字", 
        icon:"ios-calculator",
        props:_types.merge(_types.placeholder,...props)
    },
    AdvNumber:{//仅在高级查询表单使用，隐藏 
        id: "AdvNumber", 
        title: "数字", 
        hidden:true 
    }
};
let baseParams=_types.getPropsDefault(numberTypes.Number.props);
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