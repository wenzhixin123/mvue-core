module.exports=function (options) {
  var metaEntity=_.extend({
    name:"",
    title:"",
    description:"",
    isRemote:false,
    tableDroppable:false,
    tableFieldAddable:false,
    fields:{},
    relations:{},
    _model:null
  },options);

/**
 * 获取Id字段
 * @returns {Array}
 */
metaEntity.getIdField=function(){
  var idField=null;
  _.forEach(this.fields,function (metaField,key) {
    if(metaField.identity){
      idField=metaField;
    }
  });
  return idField;
};

metaEntity.findField=function (fieldName) {
  var field;
  if(_.isEmpty(fieldName)){
    return null;
  }
  _.forEach(this.fields,function (metaField,key) {
    if(fieldName.toLowerCase()==key.toLowerCase()){
      field=metaField;
      return false;
    }
  });
  return field;
}

/**
 * 第一个语义为的title字段
 */
metaEntity.firstTitleField=function () {
  return this.firstSemanticsField("title");
};

/**
 * 获取每一个语义为semantics的字段
 * @param semantics 语义，语义有：title | summary | description | createdAt | updatedAt | createdBy | updatedBy
 * @returns {*}
 */
metaEntity.firstSemanticsField=function (semantics) {
  var field=null;
  _.forEach(this.fields,function (metaField,key) {
    if(metaField.semantics==semantics
      || (_.isArray(metaField.semantics)&& _.includes(metaField.semantics,semantics))){
      field=metaField;
      return false;
    }
  });
  return  field;
};

/**
 * 根据源字段，及目标实体（可为空）查询关系字段
 * @param sourceField
 * @param targetEntity
 */
metaEntity.findRelation=function(sourceField,targetEntity){
  var relation=null;
  var self=this;
  _.forEach(self.relations,function(metaRelation,key){
    var eqTargetEntity=true;
    if(!_.isEmpty(targetEntity)){
      eqTargetEntity=(metaRelation.targetEntity.toLowerCase()==targetEntity.toLowerCase());
    }
    if(!eqTargetEntity){
      return;
    }
    var eqField=false;
    _.forEach(metaRelation.joinFields,function(joinField,index){
      if(eqField){
        return false;
      }
      if(_.isString(joinField)){
        eqField=(sourceField.toLowerCase()== joinField.toLowerCase());
        return;
      }
      if(_.isPlainObject(joinField) && !_.isEmpty(joinField["local"])){
        eqField=(sourceField.toLowerCase()==joinField["local"].toLowerCase());
        return;
      }
    });
    if(eqField){
      relation=metaRelation;
      return false;
    }
  });
  return relation;
}
/** 
 * 构造实体数据操作的基本数据模型，会包含需要提交到后台的所有字段
*/
metaEntity.getDefaultModel=function(){
  var model={};
  _.forEach(this.fields,function (metaField,key) {
    if(!metaField.identity&&!_.includes(["createdAt","updatedAt","createdBy","updatedBy"],metaField.semantics)){
      if(metaField.inputTypeParams["options"]){//选项类型默认值由options的checked属性指定
        model[key]=null;
      }else{
        model[key]=metaField.default;
      }
    }
  });
  return model;
}
/**
 * 构造实体默认表单显示的所有字段
 */
metaEntity.getDefaultFormFields=function(){
  var fields=[];
  _.forEach(this.fields,function (metaField,key) {
    if(!metaField.identity&&!_.includes(["redundant","createdAt","updatedAt","createdBy","updatedBy"],metaField.semantics)){
      fields.push(key);
    }
  });
  return fields;
}
/**
 * 构造实体默认视图显示的所有字段
 */
metaEntity.getDefaultViewFields=function(){
  var fields=[];
  _.forEach(this.fields,function (metaField,key) {
    if(!metaField.identity&&!_.includes(["redundant"],metaField.semantics)){
      fields.push(key);
    }
  });
  return fields;
}
metaEntity.dataResourceUrl=function(){
  var pathname=_.trim(this.resourceUrl,'/');
  var resourceName=pathname+'{/id}';
  return resourceName;
}
/**
 * 构造实体数据crud操作的vue-resource对象
 */
metaEntity.dataResource=function(){
  var resourceName=this.dataResourceUrl();
  var dataResource = Vue.resource(resourceName);
  return dataResource;
}


/**
 * 构造默认的创建表单Path
 */
metaEntity.formPathForCreate=function () {
  var path=`/entities/${this.name}/create`;
  return path;
}

/**
 * 默认的修改表单Path
 * id 是要编辑的数据的id值
 * @returns {string}
 */
metaEntity.formPathForEdit=function (id) {
  var path=`/entities/${this.name}/edit/${id}`;
  return path;
}
/**
 * 实体数据列表的路径地址
 */
metaEntity.viewPath=function(){
  var path= `/entities/${this.name}/list`;
  return path;
}

return metaEntity;
}

