const uuidv1 = require('uuid/v1');
import constants from './constants'

var defaultValue=[
    {id:uuidv1(),text:"选项1",children:[]},
    {id:uuidv1(),text:"选项2",children:[]}
];
var selectTexts=["请选择","请选择","请选择","请选择"];
var types={
    CascadeSelect:{
        id: "CascadeSelect", 
        title: "级联下拉", 
        icon:"ivu-icon ivu-icon-ios-more-outline"
    },
};
var componentParams={
    CascadeSelect:{
        cascadeOptions:{
            options:defaultValue,
            levels:2,
            selectTexts:selectTexts
        }
    }
};
function accept(componentType){
    return !!types[componentType];
}
var newOne=function(){
    return {id:uuidv1(),text:"新选项",children:[]};
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    let rkey=constants.entityModelRedundantKey;
    var $data=(item[rkey]&&item[rkey][fieldName])||{};
    let optionTexts=[];
    _.each(origin,function(v){
      let optionText=$data[v];
      if(!_.isNil(optionText)){
          optionTexts.push(optionText);
      }
    });
    return optionTexts.join("/")||origin.join("/");
}
export default{
    types:types,
    componentParams:componentParams,
    newOne:newOne,
    defaultValue:defaultValue,
    selectTexts:selectTexts,
    accept:accept,
    formatData:formatData
}