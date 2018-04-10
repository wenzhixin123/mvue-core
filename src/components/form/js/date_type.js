var moment = require('moment'); 
//定义基础组件:日期和时间类型
var dateTypes={
    Date:{ 
        id: "Date", 
        title: "日期", 
        icon:"ivu-icon ivu-icon-ios-calendar-outline"
    },
    Time:{ 
        id: "Time", 
        title: "时间", 
        icon:"ivu-icon ivu-icon-ios-clock-outline" 
    },
    DateTime:{ 
        id: "DateTime", 
        title: "日期时间", 
        icon:"ivu-icon ivu-icon-calendar" 
    },
    DateRange:{ 
        id: "DateRange", 
        title: "日期范围", 
        icon:"ivu-icon ivu-icon-ios-calendar-outline",
        hidden:true 
    },
    TimeRange:{ 
        id: "TimeRange", 
        title: "时间范围", 
        icon:"ivu-icon ivu-icon-ios-clock-outline",
        hidden:true  
    },
    DateTimeRange:{ 
        id: "DateTimeRange", 
        title: "日期时间范围", 
        icon:"ivu-icon ivu-icon-calendar",
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
        datePrecision:datePrecision.day
    },
    Time:{
        timePrecision:timePrecision.second
    },
    DateTime:{
        datePrecision:datePrecision.day,
        timePrecision:timePrecision.second
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
    let _d=moment(value,'YYYY-MM-DD');
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
    let _d=moment(value,'HH:mm:ss');
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
    let _d=moment(value);
    if(timePrecision.minute===precision){
        _valueValidPart=_d.format('YYYY-MM-DD HH:mm');
    }else{
        _valueValidPart=_d.format('YYYY-MM-DD HH:mm:ss');
    }
    return _valueValidPart;
}
function formatData(componentType,item,metaField){
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
    }
    return result;
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
    formatData:formatData
}