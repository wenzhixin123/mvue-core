import context from '../../../libs/context';
import constants from './constants';
var dayjs = require("dayjs");
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
var datePrecision={
    day:"day",
    month:"month",
    year:"year"
};
var timePrecision={
    second:"second",
    minute:"minute"
};
//日期相关组件的扩展参数定义
var componentParams={
    Date:{
        datePrecision:datePrecision.day,
        defaultValueType:null
    },
    Time:{
        timePrecision:timePrecision.second,
        defaultValueType:null
    },
    DateTime:{
        datePrecision:datePrecision.day,
        timePrecision:timePrecision.second,
        defaultValueType:null
    },
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
            let gridFormatter=metaField.inputTypeParams&&metaField.inputTypeParams.gridFormatter;
            if(!gridFormatter){
                gridFormatter=context.getSettings().control.dateTime.gridFormatter;
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