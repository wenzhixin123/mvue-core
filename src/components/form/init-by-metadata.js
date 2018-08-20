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
export default {initModelByQueryParams}