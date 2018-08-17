/**
 * 提供元数据与grid整合的功能
 */
import controlTypeService from '../../form/js/control_type_service';
import renderManager from './metagrid_render';
/**
 *  将metaField转成ivue需要的col对象
 * @param metaField
 */
function metaFieldToCol(context,metaField,initialCol) {
  var col = {
    title: metaField.title,
    key: metaField.name,
    sortable: metaField.sortable,
    _metaField: metaField,
    fixed:metaField.fixed,
    align:metaField.align,
  };
  if(metaField.width){
    col.width=metaField.width;
  }
  //优先根据前端设置的type字段，设置列的渲染方式
  if (metaField.type == "operation") {
    col.render = renderManager.renderForOperation(context,metaField);
  }else if (metaField.isTitleField||metaField.type == "optsTitle") {
    if(context.grid.operationsWithTitleColumn){
        col.render = renderManager.renderForOptsTitle(context,metaField);
        col.width=col.width||350;
    }else {
        col.render=renderManager.renderForLinkTitle(context,metaField,context.metaEntity.getIdField().name);
    }
  } else if (metaField.type == "imgTitle") {
    col.render = renderManager.renderForImgTitle(context,metaField);
  } else if(metaField.autoFilterable&&
    controlTypeService.isOptions(metaField.inputType)){//如果是选项列，自动添加列头过滤相关功能
    col.filterMultiple=false;
    col.filterRemote=(selectedValues)=>{//远程过滤
                        //修改过滤条件
                        var _filter=null;
                        if(initialCol.filterMultiple){
                          _filter={
                            op:'in',
                            value:selectedValues.join(',')
                          };
                        }else{
                          _filter={
                            op:'eq',
                            value:selectedValues[0]
                          };
                        }
                        context.grid.filtersFromColumnHeader[col.key]=_filter;
                        //重新加载数据
                        context.grid.$refs.listInst.doReload();
                    };
    let options=metaField.inputTypeParams&&
      metaField.inputTypeParams["options"],_filters=[]; 
    _.each(options,opt=>{
      _filters.push({
        label:opt.text,
        value:opt.id
      });
    })
    col.filters=_filters;
    col.render = renderManager.renderForCommon(context,metaField);
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

function buildInnerColumns(columns,metaEntityObj,context){
  var _cols=[];
  _.each(columns,function(col){
    var metaParams=col.metaParams ||{};
    var _col=_.omit(col,["metaParams"]);
    var metaField={name:_col.key};
    if(metaEntityObj!=null){
      metaField=metaEntityObj.findField(_col.key) || {};
    }
    metaField=_.extend(metaField,metaParams);
    var defaultCol=metaFieldToCol(context,metaField,_col);
    _col=_.extend(defaultCol,_col);
    _cols.push(_col);
  });
  return _cols;
}
/**
 * 根据元数据信息初始化列，所以没有元数据信息不做初始化
 */
function  initColumns(grid) {
  var metaEntityObj=null;
  if(!_.isEmpty(grid.metaEntity)){
    metaEntityObj=grid.metaEntity;
  }
  var context={
    grid:grid,
    metaEntity:metaEntityObj
  };
  let _cols=[];
  //如果没有传入任何columns，并且元数据信息存在，构造默认列
  if(!grid.innerColumns&&metaEntityObj){
    let defaultFormFields=metaEntityObj.getDefaultViewFields();
    _.each(defaultFormFields,function(fieldName){
      _cols.push({key:fieldName});
    });
  }else{
    _cols=grid.innerColumns;
  }
  var __cols=[];
  //序号列放在多选列前面
  if(grid.showIndex) {
      __cols.push({
          type: 'index',
          width: 50,
          align: 'center'
      });
  }
  //if(grid.innerToolbar.batchBtns&&grid.innerToolbar.batchBtns.length>0){
  __cols.push({type: 'selection',width:50,align:"center"});
  //}

  _cols=__cols.concat(_cols);
  //如果操作列不和标题列合并，并且定义了单行操作，默认最后一列为操作列
  if(!grid.operationsWithTitleColumn&&!_.isEmpty(grid.innerToolbar.singleBtns)){
    _cols.push({
      title:"具体操作",
      width:180,
      align:"center",
      metaParams:{
        type:"operation"
      }
    });
  }
  //如果元数据信息存在，用metaField初始化列，操作列也要转化成render列
  _cols=buildInnerColumns(_cols,metaEntityObj,context);
  grid.innerColumns=_cols;
}
export default{
  initColumns:initColumns,
}



