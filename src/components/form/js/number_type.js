
//定义基础组件:数字类型基础组件定义
var numberTypes={
    NumberInput:{ 
        id: "NumberInput", 
        title: "数字", 
        icon:"ivu-icon ivu-icon-ios-compose-outline"
    }
};
//数值类型组件的扩展参数
var componentParams={
    NumberInput:{
        limitRange:{
            limit:false,//是否限制数据范围
            max:null,//最大值
            min:0//最小值
        },
        decimal:{
            isAllowed:false,//是否允许小数
            digits:2//小数位数
        },
        allowNegative:false,//是否允许负数
        unit:""//TODO 单位，显示的单位
    }
};
//判断是否数值类型组件
function accept(componentType){
    return !!numberTypes[componentType];
}
export default{
    types:numberTypes,
    componentParams:componentParams,
    accept:accept
}