import propParser from '../../../services/tool/prop_parser';
var utils={
    expandOperation:function(operation,ctx){
        var params={};
        _.forIn(operation.props,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        return _.extend(operation,params);
    },
    operationDisplayField:"display"
};
export default utils;