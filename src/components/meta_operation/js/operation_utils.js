import propParser from '../../../services/tool/prop_parser';
var utils={
    expandOperation:function(operation,ctx){
        var params={};
        _.each(operation.props,function(propValue,propKey){
            if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                var parsedValue=propParser.parse(propValue,ctx);
                params[propKey]=parsedValue;
            }
        });
        return _.extend(operation,params);
    },
    execution(operation,_widgetCtx,before_after){
        //操作执行前后逻辑
        return new Promise(function(resolve, reject) {
            let value=true;
            if(operation[before_after]) {
                if (_.isFunction(operation[before_after])) {
                    value = operation[before_after](_widgetCtx, this)
                } else {
                    value = Function('"use strict";return ' + operation[before_after])(_widgetCtx, this);
                }
                resolve(value);
            }else{
                resolve(value);
            }
        });
    }
};
export default utils;