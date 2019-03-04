import metabase from '../../../libs/metadata/metabase';
import rowMeta from './row-meta';
var types={
    RefEntity:{ 
        id: "RefEntity", 
        title: "引用实体", 
        icon:"ivu-icon ivu-icon-pound"
    },
    MultiRefEntity:{ 
        id: "MultiRefEntity", 
        title: "多选引用实体", 
        icon:"ivu-icon ivu-icon-pound"
    },
    ParentSelect:{ 
        id: "ParentSelect", 
        title: "父选择器", 
        icon:"ivu-icon ivu-icon-pound"
    },
};
var componentParams={
    RefEntity:{
        entityId:"",//必填
        idField:"",//必填
        titleField:"",//必填
        orderbyField:"",//排序字段
        orderbyType:"asc",//排序规则
        entityResourceUrl:""//后端自动生成
    },
    MultiRefEntity:{
        entityId:"",//必填
        idField:"",//必填
        titleField:"",//必填
        orderbyField:"",//排序字段
        orderbyType:"asc",//排序规则
        entityResourceUrl:""//后端自动生成
    },
    ParentSelect:{
        entityId:"",//必填
        idField:"",//必填
        titleField:"",//必填
        orderbyField:"",//排序字段
        orderbyType:"asc",//排序规则
        entityResourceUrl:""//后端自动生成
    }
};
function accept(componentType){
    return !!types[componentType];
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    var relation=metaField.manyToOneRelation||metaField.embeddedRelation;
    var expandData=item[relation.name];
    let targetEntity=metabase.findMetaEntity(relation.targetEntity);
    let titleField=targetEntity.firstTitleField().name;
    if(!titleField || !expandData){
        return rowMeta.title(item,fieldName)||origin;
    }
    if(_.isArray(origin)){
        let titleArray=[];
        _.each(expandData,ed=>{
            titleArray.push(ed[titleField]);
        });
        return titleArray.join(',');
    }else{
        return expandData[titleField];
    }
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
function fillComponentParams(formItem,metaField){
    var relation=metaField.manyToOneRelation||metaField.embeddedRelation;
    var itemEntityName=metaField.xAttrs&&metaField.xAttrs.targetEntity;
    var targetEntityName=null;
    if(relation){
        targetEntityName=relation.targetEntity;
    }else if(itemEntityName){
        targetEntityName=itemEntityName;
    }
    if(targetEntityName){
        let targetEntity=metabase.findMetaEntity(targetEntityName);
        if(targetEntity){
            let idField=targetEntity.getIdField();
            let titleField=targetEntity.firstTitleField();
            formItem.componentParams.entityId=targetEntityName;
            formItem.componentParams.idField=idField.name;
            formItem.componentParams.titleField=titleField?titleField.name:idField.name;
            formItem.componentParams.entityResourceUrl=targetEntity.dataResourceUrl();
        }else{
            console.log(`关系字段${metaField.name}的引用实体${targetEntity}不存在`);
        }
    }
}
export default{
    types:types,
    accept:accept,
    componentParams:componentParams,
    formatData:formatData,
    formatDataForExport,
    fillComponentParams:fillComponentParams
}