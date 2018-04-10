/**
 * 元数据管理
 * Created by fulsh on 2017/12/12.
 */
import controlTypeService from '../../components/form/js/control_type_service';
var Config=require("../../config/config");

var MetaEntityCls=require("./metaentity");
var mbCacheKey="_mb_";
var mbModule={};

var metabase={
  synced:false,
  entities:null,
  lastUpdate:new Date().getTime()
};
if(store.has(mbCacheKey)){
  metabase=store.get(mbCacheKey);
  metabase.synced=false;
}

/**
 * 同步初始化Mb
 */
function  initMetabase(){
  if(metabase.synced){
    return ;
  }
  var ajaxAsync=true;
  if(metabase.entities==null){
    ajaxAsync=false;
  }
  var swagger=Config.getApiBaseUrl()+"/swagger.json";
  return jQuery.ajax({
    url:swagger,
    dataType:"json",
    async:ajaxAsync,
    statusCode:{404:function () {
        alert("加载元数据定义失败，请确认以下配置是否正确："+swagger);
      }},
    success:function (swaggerJson) {
      if(metabase.synced){
        return ;
      }
      loadMetabase(swaggerJson);
      console.log("async("+ajaxAsync+")load metabase from "+swagger);
    }
  });
}

/**
 * 将swagger 转为Metabase
 * @param swagger
 */
function loadMetabase(swagger){
  var context={
    swagger:swagger
  };
  var entities={};
  _.forEach(swagger.definitions,function(val,key){
    var isEntity=firstNotNaN(val["x-entity"],true);
    if(!isEntity){
      return;
    }
    var metaEntity=loadMetaEntityFromMode(context,key,val);
    entities[key.toLowerCase()]=metaEntity;
  });
  metabase.entities=entities;
  metabase.synced=true;
  metabase.lastUpdate=new Date().getTime();
  store.set(mbCacheKey,metabase);
}

/**
 * 将swagger的model转为MetaEntity
 * @param context
 * @param model
 */
function loadMetaEntityFromMode(context,modelName,model){
  var entityPath=_.snakeCase(modelName);
  var opt={
    name:modelName,
    title:model.title,
    description:model.description,
    _model:model,
    resourceUrl:`${Config.getApiBaseUrl()}/${entityPath}`
  };
  var metaEntity=MetaEntityCls(opt);
  var propertyContext=_.extend({
    metaEntity:metaEntity,
    model:model
  },context);
  var index=0;
  var relations=[];
  _.forEach(model.properties,function (val,key) {
    var isRelation=firstNotNaN(val["x-relation"],false);
    if(isRelation){
      var metaRelation=loadMetaRelationFromProperty(propertyContext,key,val);
      relations.push(metaRelation);
      return;
    }
    var metaField=loadMetaFieldFromProperty(propertyContext,key,val);
    metaField["displayOrder"]=index;
    metaEntity.fields[key]=metaField;
    index++;
  });

  _.forEach(relations,function (metaRelation,i) {
    _.forEach(metaRelation.joinFields,function(joinField,index){
      var relationField=null;
      if(_.isString(joinField)){
        relationField=metaEntity.fields[joinField];
      }
      if(relationField==null && _.isPlainObject(joinField) && !_.isEmpty(joinField["local"])){
        relationField=metaEntity.fields[joinField["local"]];
      }
      if(relationField!=null){
        relationField.isRelationField=true;
        relationField.relations.push(metaRelation);
        //多对一关系的字段修正为引用实体控件类型
        if(metaRelation.type=="many-to-one"&&
        ((!relationField.inputType)||
        (relationField.inputType==controlTypeService.componentTypes.RefEntity.id)||
        (relationField.inputType==controlTypeService.componentTypes.SingleLineText.id))){
          relationField.inputType=controlTypeService.componentTypes.RefEntity.id;
          relationField.manyToOneRelation=metaRelation;
        }
      }
    });

      metaEntity.relations[metaRelation.name]=metaRelation;
  });
  //初始化实体模型数据
  metaEntity.defaultModel=metaEntity.getDefaultModel();
  return metaEntity;
}

/**
 * 将Property构造成metafield对象
 * @param context
 * @param propertyName
 * @param property
 */
function loadMetaFieldFromProperty(context,propertyName,property){
  var metaField={
    name:propertyName,
    title:firstNotNaN(property["title"],property["description"],propertyName),
    entityName:context.metaEntity.name,
    published:true,
    summary:property["description"],
    description:property["description"],
    default:property["default"]||null,
    isSystem:true,
    isDisplay:true,
    displayOrder:0,
    identity:firstNotNaN(property["x-identity"],false),
    autoIncrement:false,
    unique:firstNotNaN(property["x-unique"],property["uniqueItems"],false),
    required:firstNotNaN(property["x-required"],false),
    creatable:firstNotNaN(property["x-creatable"],true),
    updatable:firstNotNaN(property["x-updatable"],property["readOnly"],true),
    sortable:firstNotNaN(property["x-sortable"],false),
    filterable:firstNotNaN(property["x-filterable"],false),
    inputType:property["x-input"],
    inputTypeParams:{},
    semantics:property["x-meaning"],
    maxLength:property["maxLength"],
    minLength:property["minLength"],
    pattern:property["pattern"],
    maximum:property["maximum"],
    minimum:property["minimum"],
    enum:property["enum"],
    type:property["type"],
    format:property["format"],
    isRelationField:false,
    relations:[],
    _property:property
  };
  //设置inputTypeParams
  fillInputTypeParams(metaField,property);
  return metaField;
}

/**
 * 设置metaField的inputTypeParams参数
 * @param metaField
 * @param property
 */
function fillInputTypeParams(metaField,property) {
  //如果metaField的inputType为空，设置默认
  if(!metaField.inputType){
    let inputType=controlTypeService.getMetaFieldComponentType(metaField);
    metaField.inputType=inputType;
  }
  if(_.isNaN(property["maxLength"])){
    metaField.inputTypeParams["maxLength"]=property["maxLength"];
  }
  if(_.isNaN(property["minLength"])){
    metaField.inputTypeParams["minLength"]=property["minLength"];
  }
  if(_.isNaN(property["pattern"])){
    metaField.inputTypeParams["pattern"]=property["pattern"];
  }
  if(_.isNaN(property["maximum"])){
    metaField.inputTypeParams["max"]=property["maximum"];
  }
  if(_.isNaN(property["minimum"])){
    metaField.inputTypeParams["min"]=property["minimum"];
  }
  if(_.isNaN(property["enum"])){
    metaField.inputTypeParams["enums"]=property["enum"];
  }
  if(_.isNaN(property["format"])){
    metaField.inputTypeParams["format"]=property["format"];
  }
  if(property["x-options"]&&property["x-options"].items){
    let options=[];
    _.each(property["x-options"].items,function (item,index) {
      options.push({
        id:item.value,
        text:item.title,
        checked:metaField.default==item.value?true:false
      });
    });
    metaField.inputTypeParams["options"]=options;
  }
}

/**
 * 根据关系属性构造关系
 * @param context
 * @param propertyName
 * @param property
 */
function loadMetaRelationFromProperty(context,propertyName,property){
  var metaRelation={
    name:propertyName,
    type:firstNotNaN(property["x-relation-type"],"many-to-one"),
    sourceEntity:context.metaEntity.name,
    targetEntity:property["x-target-entity"],
    joinEntity:property["x-join-entity"],
    joinFields:property["x-join-fields"],     //[{"local":"updatedBy","target":"userId"}]
    expandable:firstNotNaN(property["x-expandable"],false),
    _property:property
  };
  return metaRelation;
}


/**
 * 获取第一个非undefined的参数
 */
function firstNotNaN(){
  var reval;
  _.forEach(arguments,function (item,index) {
    if(!_.isUndefined(item)){
      reval=item;
      return false;
    }
  });
  return reval;
}


//初始化metabase
//initMetabase();

export default{
  /**
   * 根据实体名，查询实体
   * @param metaEntityName
   * @returns {*}
   */
  findMetaEntity:function (metaEntityName) {
    if(!metaEntityName){
      return null;
    }
    var metaEntity= metabase.entities[metaEntityName.toLowerCase()];
    if(_.isEmpty(metaEntity)){
      return null;
    }
    var metaEntityCloned =MetaEntityCls(metaEntity);
    return metaEntityCloned;
  },
  /**
   * 获取所有实体
   * @returns {null}
   */
  entities:function () {
    return metabase.entities;
  },
  /**
   * 刷新实体缓存
   */
  refresh:function () {
    metabase.synced=false;
    initMetabase();
  },
  initMetabase:initMetabase
}
