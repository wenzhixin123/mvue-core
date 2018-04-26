//用来将部件或者操作的props根据属性类型转换成具体的属性值

function fromQuery(key,curInst){
    return curInst.$route.query[key];
}
function fromPath(key,curInst){
    return curInst.$route.params[key];
}
//操作的属性需要从widgetContext映射的
function fromContext(key,curInst){
    return curInst.widgetContext&&curInst.widgetContext[key];
}
function parseFrom(value,curInst){
    var from=value.from,key=value.key;
    if(from=="query"&&key){
        return fromQuery(key,curInst);
    }else if(from=="path"&&key){
        return fromPath(key,curInst);
    }else if(from=="context"&&key){
        return fromContext(key,curInst);
    }else{
        return value;
    }
}
//不同类型转换器定义
var parsers={
    "text":function(initPropValue,curInst){
        var value=initPropValue.value;
        //非普通对象不需要转换直接返回
        if(!_.isPlainObject(value)){
            return value;
        }
        return parseFrom(value,curInst);
    },
    "map":function(initPropValue,curInst){
        var value=initPropValue.value;
        var _query={};
        _.each(value,function(v,k){
            _query[k]=parseFrom(v,curInst);
        });
        return _query;
    }
};
const parser={
    /**
     * 
     * @param {*} initPropValue 属性的原始定义
     * @param {*} curInst 当前页面的Vue实例，可以访问路由等参数
     */
    parse(initPropValue,curInst){
        var type=initPropValue.type;
        if(!!type){
            //根据类型转到各类型的转换器转换
            var _parse=parsers[type];
            if(_parse){
                return _parse(initPropValue,curInst);
            }else{
                console.log(`未定义属性type:${type}的转换器`);
                return initPropValue;
            }
        }else{
            return initPropValue;
        }
    }
}
export default parser