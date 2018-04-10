/**
 * 提供元数据与grid整合的功能
 */
import controlTypeService from '../../form/js/control_type_service';
import metabase from '../../../libs/metadata/metabase';
import renderManager from './metagrid_render';
import operationManager from './metagrid_operation';

/**
 *  将metaField转成ivue需要的col对象
 * @param metaField
 */
function metaFieldToCol(context,metaField) {
  var col = {
    title: metaField.title,
    key: metaField.name,
    sortable: metaField.sortable,
    _metaField: metaField,
  };
  //优先根据前端设置的type字段，设置列的渲染方式

  if (metaField.type == "operation") {
    col.render = renderManager.renderForOperation(context,metaField);
  }else if (metaField.type == "imgTitle") {
    col.render = renderManager.renderForImgTitle(context,metaField);
  } else {
    if (controlTypeService.isPictureUpload(metaField.inputType)) {
      col.render = renderManager.renderForPictureUpload(context,metaField);
    } else if (controlTypeService.isFileUpload(metaField.inputType)) {
      col.render = renderManager.renderForFileUpload(context,metaField);
    } else {
      col.render = renderManager.renderForCommon(context,metaField);
    }
  }
  return col;
}

/**
 * 根据元数据信息初始化Grid
 * @param grid
 */
function initGridByMetabase(grid) {
  intiGridProperties(grid);

  initToolBar(grid);

  initColumns(grid);
}


/**
 * 实始化grid的基本属性
 * @param grid
 */
function intiGridProperties(grid) {
  var metaEntityObj=null;
  if(!_.isEmpty(grid.metaEntity)){
    metaEntityObj=metabase.findMetaEntity(grid.metaEntity);
    let updatedAtField=metaEntityObj.firstSemanticsField("updatedAt");
    if(updatedAtField&&!grid.queryOptions){//实体有更新时间字段，并且queryOptions没写，则按照更新时间降序排列
      grid.innerQueryOptions={orderby:`${updatedAtField.name} desc`};
    }
  }
  if(metaEntityObj==null){
    return;
  }

  if(_.isEmpty(grid.queryResource)&&_.isEmpty(grid.queryUrl)){
    grid.innerQueryResource=metaEntityObj.dataResource();
  }
}
function buildInnerColumns(columns,metaEntityObj,context){
  var _cols=[];
  _.each(columns,function(col){
    var metaParams=col.metaParams ||{};
    var _col=_.omit(col,["metaParams"]);
    var metaField={};
    if(metaEntityObj!=null){
      metaField=metaEntityObj.findField(_col.key) || {};
    }
    metaField=_.extend(metaField,metaParams);
    var defaultCol=metaFieldToCol(context,metaField);
    _col=_.extend(defaultCol,_col);
    _cols.push(_col);
  });
  return _cols;
}
/**
 * 初始化列
 */
function  initColumns(grid) {
  var metaEntityObj=null;
  if(!_.isEmpty(grid.metaEntity)){
    metaEntityObj=metabase.findMetaEntity(grid.metaEntity);
  }
  var context={
    grid:grid,
    metaEntity:metaEntityObj
  };
  //如果没有传递columns通过实体字段构造
  if(!grid.columns&&metaEntityObj){
    let defaultFormFields=metaEntityObj.getDefaultViewFields();
    let _cols=[];
    _.each(defaultFormFields,function(fieldName){
      _cols.push({key:fieldName});
    });
    //默认最后一列为操作列
    _cols.push({
      title:"具体操作",
      width:220,
      align:"center",
      metaParams:{
        type:"operation",
        btns:["edit","del"]
      }
    });
    _cols=buildInnerColumns(_cols,metaEntityObj,context);
    grid.innerColumns=_cols;
  }else{
    let _cols=buildInnerColumns(grid.columns,metaEntityObj,context);
    grid.innerColumns=_cols;
  }
}

function  initToolBar(grid) {
  var btns=[];
  var metaEntityObj=null;
  let titleField=null;
  if(!_.isEmpty(grid.metaEntity)){
    metaEntityObj=metabase.findMetaEntity(grid.metaEntity);
    titleField=metaEntityObj.firstSemanticsField("title");
  }
  var context={
    grid:grid,
    metaEntity:metaEntityObj
  };
  if(!grid.toolbar){//外部没有定义toolbar，根据实体构造
    let _toolbar={
      btns:["create"]
    };
    if(titleField){
      _toolbar.quicksearch={
        fields:[titleField.name],
        placeholder:"根据名称搜索"
      }
    }
    _.each(_toolbar.btns,function (btn,index) {
      var mergedBtn=operationManager.fillOperationByMb(context,btn);
      btns.push(mergedBtn);
    });
    _toolbar.btns=btns;
    grid.innerToolbar=_toolbar;
  }else{
    _.forEach(grid.innerToolbar.btns,function (btn,index) {
      var mergedBtn=operationManager.fillOperationByMb(context,btn);
      btns.push(mergedBtn);
    });
    grid.innerToolbar.btns=btns;
  }
}

export default{
  initGridByMetabase:initGridByMetabase,
}



