//创建模式时，如果url参数是实体的字段则填充相应的模型数据
function initModelByQueryParams(formInst,_model){
    var metaEntity=formInst.metaEntity;
    var query=formInst.$route.query;
    _.forIn(query,function(value,key){
        let metaField=metaEntity.findField(key);
        if(metaField){
            _model[key]=value;
        }
    });
}
//根据关系填充模型关系字段数据：只考虑多对一关系
function initModelByRelation(formInst,_model){
    var metaEntity=formInst.metaEntity;
    _.forIn(_model,function(value,key){
        let relationField=metaEntity.findField(key);
        if(relationField&&relationField.manyToOneRelation){
            let r=relationField.manyToOneRelation;
            let targetEntity=r.targetEntity;
            let refEntity=formInst.$store.getters['core/getEntity'](targetEntity);
            if(refEntity){
                let idField=formInst.$metaBase.findMetaEntity(targetEntity).getIdField().name;
                _model[key]=refEntity[idField];
            }
        }
    });
}
export default {initModelByQueryParams,initModelByRelation}