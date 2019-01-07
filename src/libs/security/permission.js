import context from "../context";
import metabase from "../metadata/metabase";

var ops={
    "$op":"",
    "entities":{
        "$entity":{
            "$op":""
        }
    }
};

function getSecurityEndpoint() {
    var baseUrl=context.getMvueToolkit().config.getApiBaseUrl();
    return baseUrl+"/_ops.json";
}

function init() {
    var url=getSecurityEndpoint();
    return Promise.resolve().then(()=>{
        if(context.getMvueToolkit().session.isLogin()){
            return context.getMvueToolkit().http.get(url).then(({data})=>{
                ops=data;
                return ops;
            });
        }
        return null;
    });
}

function hasPerm(op,metaEntityName) {
    if(_.isEmpty(op)){
        return true;
    }
    var indexOfSplit=op.indexOf(":");
    if(indexOfSplit>0){
        if(_.isEmpty(metaEntityName)){
            metaEntityName=op.substring(0,indexOfSplit);
        }
        op=op.substring(indexOfSplit+1);
    }

    if(_.isEmpty(metaEntityName)){
        return _.has(ops,op);
    }

    var metaEntity=metabase.findMetaEntity(metaEntityName);
    if(metaEntity){
        var entityOps=ops["entities"] && ops["entities"][metaEntity.name];
        if(entityOps==null){
            return false;
        }
        return _.has(entityOps,op);
    }
    return false;
}

export  default {
    init:function () {
       return init();
    },
    hasPerm:function (op,metaEntity) {
        if(!_.isArray(op)){
            return hasPerm(op,metaEntity);
        }
        var result=true;
        _.forEach(op,p1=>{
            var r=hasPerm(p1,metaEntity);
            if(!r){
                result=false;
                return false;
            }
        });
        return result;
    }
}

