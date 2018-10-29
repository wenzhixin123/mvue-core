/**
 * 元数据管理
 * Created by fulsh on 2017/12/12.
 */
import controlTypeService from '../../components/form/js/control_type_service';
import context from "../context";

var store=require("store2");

var MetaEntityCls=require("./metaentity");
//当前项目的id
var currentProjectId=null;
//当前项目的engine地址
var currentEngineUrl=null;
//所有项目对应的元数据，以项目mbCacheKey存储
var metabases={};

/**
 * 根据项目id构建项目元数据访问的key
 * @param {*} projectId 
 */
function mbCacheKey(projectId){
  return projectId?`${projectId}/_mb_`:`_mb_`;
}
/**
 * 根据传入的项目id获取项目元数据
 * @param {*} projectId 
 */
function getMetabase(projectId){
  var cacheKey=mbCacheKey(projectId);
  //先从内存获取
  if(metabases[cacheKey]){
    return metabases[cacheKey];
  }
  //再从本地存储获取
  if(store.has(cacheKey)){
    return store.get(cacheKey);
  }
  return null;
}
/**
 * 获取当前项目的swagger地址
 */
function currentSwagger(projectId){
  if(!projectId){
    var swaggerBaseUrl=context.getConfig().getApiBaseUrl();
    currentEngineUrl="";
    if(!swaggerBaseUrl){
      console.log("提示：apiBaseUrl未配置，暂时无法使用元数据相关功能");
      return Promise.resolve();
    }
    return new Promise(function(reslove,reject){
      var swagger= swaggerBaseUrl+"/swagger.json";
      reslove(swagger);
    });
  }
  var metaserviceUrl=context.getConfig().getMetaserviceUrl();
  if(!metaserviceUrl){
    console.log("提示：service.metabase.endpoint未配置，暂时无法使用元数据相关功能");
    return Promise.resolve();
  }
  return metaservice().getProject({id:projectId}).then(({data})=>{
    if(!data.engine||!data.engine.externalUrl){
      console.log(`项目id为${projectId}的项目engine地址不存在`);
      return null;
    }
    currentEngineUrl=data.engine.externalUrl;
    var swagger=`${data.engine.externalUrl}/swagger.json`;
    return swagger;
  });
}
/**
 * 根据项目id从远程加载项目的元数据信息
 * @param {*} projectId 
 * @param {*} forceReload 为true表示强制从远程更新元数据信息
 */
function  initMetabase(projectId,forceReload) {
    currentProjectId = projectId;
    var _metabase = getMetabase(projectId);
    if (_metabase && !forceReload) {//已经在缓存里边存在，不加载
        return;
    }
    //先通过项目id，查询项目的swagger服务地址，在通过swagger地址获取元数据信息
    return currentSwagger(projectId).then((swagger) => {
        if (!swagger) {
            return;
        }
        return context.getMvueToolkit().http.get(swagger).then(function ({data}) {
            loadMetabase(data, projectId);
            console.log("load metabase from " + swagger);
        }).catch(function (error) {
            if (error.response && error.response.status == 404) {
                alert("加载元数据定义失败，请确认以下配置是否正确：" + swagger);
            } else {
                alert('加载元数据定义失败,' + error.message);
            }
            console.log(error.config);
        });
    });
}

/**
 * 将swagger 转为Metabase
 * @param swagger
 */
function loadMetabase(swagger,projectId){
  var context={
    swagger:swagger
  };
  var entities={};
  _.forIn(swagger.definitions,function(val,key){
    var isEntity=firstNotNaN(val["x-entity"],true);
    if(!isEntity){
      return;
    }
    var metaEntity=loadMetaEntityFromMode(context,key,val);
    entities[key.toLowerCase()]=metaEntity;
  });
  var metabase={};
  metabase.entities=entities;
  var cachedKey=mbCacheKey(projectId);
  metabases[cachedKey]=metabase;
  store.set(cachedKey,metabase);
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
    resourceUrl:`${currentEngineUrl}/${entityPath}`,
    projectId:currentProjectId
  };
  var metaEntity=MetaEntityCls(opt);
  var propertyContext=_.extend({
    metaEntity:metaEntity,
    model:model
  },context);
  var index=0;
  var relations=[];
  _.forIn(model.properties,function (val,key) {
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
        if(metaRelation.type=="many-to-one"){
          relationField.manyToOneRelation=metaRelation;
          //多对一关系的字段修正为引用实体控件类型
          if(((!relationField.inputType)||
            (relationField.inputType==controlTypeService.componentTypes.RefEntity.id)||
            (relationField.inputType==controlTypeService.componentTypes.SingleLineText.id))){
            relationField.inputType=controlTypeService.componentTypes.RefEntity.id;
          }
        }else if(metaRelation.type=="many-to-many" && metaRelation.embedded){
            relationField.embeddedRelation=metaRelation;
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
    readonly:!!property["readOnly"],
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
    isTitleField:"title"===property["x-meaning"],
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
    _property:property,
    xAttrs:property["x-attrs"]||{}//扩展属性
  };
  //设置inputTypeParams
  fillInputTypeParams(metaField,property);
  return metaField;
}
//转换选项集
function optionsConvert(options,metaField){
  let _options=[];
  _.each(options,function (item,index) {
    _options.push({
      id:item.value,
      text:item.title,
      checked:metaField.default==item.value?true:false
    });
  });
  if(options.children){
    _options.children=optionsConvert(options.children,metaField);
  }
  return _options;
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
    let options=optionsConvert(property["x-options"].items,metaField);
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
  var metaRelation= {
      name: propertyName,
      type: firstNotNaN(property["x-relation-type"], "many-to-one"),
      sourceEntity: context.metaEntity.name,
      targetEntity: property["x-target-entity"],
      joinEntity: property["x-join-entity"],
      joinFields: property["x-join-fields"],     //[{"local":"updatedBy","target":"userId"}]
      expandable: firstNotNaN(property["x-expandable"], false),
      embedded: firstNotNaN(property["x-embedded"], false),
      _property: property
  };
  if(metaRelation.embedded){
      metaRelation.joinFields=[property["x-embedded-field"]];
  }
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
    var metabase=getMetabase(currentProjectId);
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
    var metabase=getMetabase(currentProjectId);
    return metabase.entities;
  },
  initMetabase:initMetabase,
  currentSwagger:currentSwagger,
  routeForEntityList(entityName,params){
    var router= {name: 'defaultEntityList', params: {entityName:entityName}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
  routeForEntityCreateForm(entityName,params){
    var router= {name: 'defaultCreateForm', params: {entityName:entityName}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
  routeForEntityUpdateForm(entityName,id,params){
    var router= {name: 'defaultEditForm', params: {entityName:entityName,id:id}};
    if(!_.isEmpty(params)){
      router.params= _.extend(router.params,params);
    }
    return router;
  },
    setEntityNameForRoute(router,entityName){
      if(_.isEmpty(router)){
          return;
      }
      router.params["entityName"]=entityName;
    }
}
