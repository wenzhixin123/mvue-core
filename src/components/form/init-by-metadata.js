import topEntityService from "../../services/store/top-entity";

//创建模式时，如果url参数是实体的字段则填充相应的模型数据
function initModelByQueryParams(formInst,_model){
    var metaEntity=formInst.metaEntity;
    //合并真实的路由query和来自弹出部件设置的createParams
    var query=_.extend(formInst.$route.query,formInst.createParams);
    _.forIn(query,function(value,key){
        let metaField=metaEntity.findField(key);
        if(metaField){
            _model[key]=value;
        }
    });
}
function initRelationField(formInst,relationFieldName,_model){
    var metaEntity=formInst.metaEntity;
    let relationField=metaEntity.findField(relationFieldName);
    if(relationField&&relationField.manyToOneRelation){
        let r=relationField.manyToOneRelation;
        let targetEntity=r.targetEntity;
        let refEntity=formInst.$store.getters['core/getEntity'](targetEntity);
        if(refEntity){
            let idField=formInst.$metaBase.findMetaEntity(targetEntity).getIdField().name;
            _model[relationFieldName]=refEntity[idField];
        }
        let topEntityRow=topEntityService.getHistory(targetEntity);
        if(topEntityRow) {
            _model[relationFieldName] = topEntityRow.value;
        }

    }
}
//根据关系填充模型关系字段数据：只考虑多对一关系
function initModelByRelation(formInst,_model){
    var metaEntity=formInst.metaEntity;
    if(formInst.relationField){
        initRelationField(formInst,formInst.relationField,_model);
    }else{
        _.forIn(_model,function(value,key){
            initRelationField(formInst,key,_model);
        });
    }
}
export default {initModelByQueryParams,initModelByRelation}