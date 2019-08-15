import context from '../../../libs/context';
import constants from './constants';
var dayjs = require("dayjs");
import _types from './_types';

var datePrecision={
    day:"day",
    month:"month",
    year:"year"
};
var timePrecision={
    second:"second",
    minute:"minute"
};
const datePrecisionProp={
    id:'datePrecision',
    inputType:_types.inputType.SingleSelect,
    default:datePrecision.day,
    store:_types.store.MetaFieldInputParams,
    options:[
        {value:datePrecision.day,title:'天'},
        {value:datePrecision.month,title:'月'},
        {value:datePrecision.year,title:'年'}
    ],
    title:'日期精确到'
};
const timePrecisionProp={
    id:'timePrecision',
    inputType:_types.inputType.SingleSelect,
    default:timePrecision.second,
    store:_types.store.MetaFieldInputParams,
    options:[
        {value:timePrecision.second,title:'秒'},
        {value:timePrecision.minute,title:'分'}
    ],
    title:'时间精确到'
};
const dateTimeFormatterProp={
    id:'formatter',
    inputType:_types.inputType.SingleSelectWithInput,
    default:'',
    store:_types.store.MetaFieldInputParams,
    options:[
        {value:'yyyy-MM-dd HH:mm:ss',title:'yyyy-MM-dd HH:mm:ss'},
        {value:'yyyy/MM/DD HH:mm:ss',title:'yyyy/MM/DD HH:mm:ss'}
    ],
    title:'格式'
};
let props={
    Date:_types.merge(datePrecisionProp,_types.defaultValue),
    Time:_types.merge(timePrecisionProp,_types.defaultValue),
    DateTime:_types.merge(datePrecisionProp,timePrecisionProp,dateTimeFormatterProp,_types.defaultValue)
};
//定义基础组件:日期和时间类型
var dateTypes={
    Date:{ 
        id: "Date", 
        title: "日期", 
        icon:"ios-calendar"
    },
    Time:{ 
        id: "Time", 
        title: "时间", 
        icon:"ios-clock-outline" 
    },
    DateTime:{ 
        id: "DateTime", 
        title: "日期时间", 
        icon:"md-calendar" 
    },
    DateRange:{ 
        id: "DateRange", 
        title: "日期范围", 
        hidden:true 
    },
    TimeRange:{ 
        id: "TimeRange", 
        title: "时间范围", 
        hidden:true  
    },
    DateTimeRange:{ 
        id: "DateTimeRange", 
        title: "日期时间范围", 
        hidden:true 
    }
};
//设置控件属性定义，到控件基础定义上
_.forIn(dateTypes,(value,key)=>{
    value.props=props[key];
});
//日期相关组件的扩展参数定义
//TODO defaultValueType 和默认值一起考虑
var componentParams={
    Date:_types.getPropsDefault(props.Date),
    Time:_types.getPropsDefault(props.Time),
    DateTime:_types.getPropsDefault(props.DateTime),
    DateTimeRange:{
        datePrecision:datePrecision.day,
        timePrecision:timePrecision.second
    }
};
//判断是否是日期或者时间相关组件
function accept(componentType){
    return !!dateTypes[componentType];
}
//判断是否日期组件
function isDate(componentType){
    return componentType===dateTypes.Date.id;
}
//判断是否时间组件
function isTime(componentType){
    return componentType===dateTypes.Time.id;
}
//判断是否日期日期组件
function isDateTime(componentType){
    return componentType===dateTypes.DateTime.id;
}
function formatDate(value,precision){
    var _valueValidPart=null;
    if(!value){
        return _valueValidPart;
    }
    let _d=dayjs(value);
    if(datePrecision.year===precision){
        _valueValidPart=_d.format('YYYY');
    }else if(datePrecision.month===precision){
        _valueValidPart=_d.format('YYYY-MM');
    }else{
        _valueValidPart=_d.format('YYYY-MM-DD');
    }
    return _valueValidPart;
}
function formatTime(value,precision){
    var _valueValidPart=null;
    if(!value){
        return _valueValidPart;
    }
    var nowDs=dayjs().format('YYYY-MM-DD');
    let _d=dayjs(`${nowDs} ${value}`);
    if(timePrecision.minute===precision){
        _valueValidPart=_d.format('HH:mm');
    }else{
        _valueValidPart=_d.format('HH:mm:ss');
    }
    return _valueValidPart;
}
function formatDateTime(value,precision){
    var _valueValidPart=null;
    if(!value){
        return _valueValidPart;
    }
    let _d=dayjs(value);
    if(timePrecision.minute===precision){
        _valueValidPart=_d.format('YYYY-MM-DD HH:mm');
    }else{
        _valueValidPart=_d.format('YYYY-MM-DD HH:mm:ss');
    }
    return _valueValidPart;
}
function formatData(componentType,item,metaField,from){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isUndefined(origin)||_.isNull(origin)||origin===''){
        return "";
    }
    let result="";
    if(isDate(componentType)){
        let datePrecision=metaField.inputTypeParams&&metaField.inputTypeParams.datePrecision;
        result= formatDate(origin,datePrecision);
    }else if(isTime(componentType)){
        let timePrecision=metaField.inputTypeParams&&metaField.inputTypeParams.timePrecision;
        result= formatTime(origin,timePrecision);
    }else if(isDateTime(componentType)){
        let timePrecision=metaField.inputTypeParams&&metaField.inputTypeParams.timePrecision;
        result= formatDateTime(origin,timePrecision);
        //如果是grid的日期时间渲染，根据gridFormatter作格式化
        if(from==='grid'&&origin){
            //字段上定义的gridFormatter优先于formatter，字段上定义的formatter优先于全局的gridFormatter
            let formatter=metaField.inputTypeParams&&metaField.inputTypeParams.formatter;
            let gridFormatter=metaField.inputTypeParams&&metaField.inputTypeParams.gridFormatter;
            if(!gridFormatter){
                gridFormatter=formatter||context.getSettings().control.dateTime.gridFormatter;
            }
            if(gridFormatter){
                let realValue=result;
                let _d=dayjs(origin);
                if(gridFormatter==='simple'){
                    result=_d.format('MM/DD HH:mm');
                }else{
                    result=_d.format(gridFormatter);
                }
                result=`${result}${constants.TitleSplitKey}${realValue}`
            }
        }
    }
    return result;
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
export default{
    types:dateTypes,
    componentParams:componentParams,
    datePrecision:datePrecision,
    timePrecision:timePrecision,
    accept:accept,
    isDate:isDate,
    isTime:isTime,
    isDateTime:isDateTime,
    formatDate:formatDate,
    formatTime:formatTime,
    formatDateTime:formatDateTime,
    formatData:formatData,
    formatDataForExport:formatDataForExport
}