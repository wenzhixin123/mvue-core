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
        if(_.has(entityOps,"*")){
            return true;
        }
        return _.has(entityOps,op);
    }
    return false;
}

export  default {
    init:function () {
       return init();
    },
    //判断实体是否有read权限
    hasReadPerm:function(entityName){
        let has=hasPerm('find',entityName);
        if(!has){
            return false;
        }
        has=hasPerm('query',entityName);
        if(!has){
            return false;
        }
        return true;
    },
    //实体操作权限判断
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
    },
    /** 行级数据权限判断
     *  @param entityData 实体的一条数据记录
     *  @param permsArray 单个权限或者权限数组，需要判断的权限 'edit' 或者 ['edit','create']
     */
    hasRowPerm(entityData,permsArray){
        let hasPermission=false;
        //
        if(!_.isArray(permsArray)){
            permsArray=[permsArray];
        }
        if(entityData && entityData["__ops__"]){
            //进行行级数据权限判断
            var itemPermOps=entityData["__ops__"];
            var matched=true;
            _.forEach(permsArray,(needPerm)=>{
                var opMatch=false;
                if(needPerm.indexOf(":")>0){
                    needPerm=needPerm.substring(needPerm.indexOf(":")+1);
                }
                _.forEach(itemPermOps,(permOp)=>{
                    if(permOp=="*" ||needPerm.toLowerCase()==permOp.toLowerCase()){
                        opMatch=true;
                        return false;
                    }
                });
                if(!opMatch){
                    matched=false;
                    return false;
                }
            });
            hasPermission=matched;
        }else{//没有权限数据，默认为有权限
            hasPermission=true;
        }
        return hasPermission;
    }
}

