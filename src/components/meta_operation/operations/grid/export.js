import ExportCsv from "../../../grid/js/export_csv";
import contextHelper from "../../../../libs/context";
import metabase from "../../../../libs/metadata/metabase";
import toolServices from '../../../../services/tool/tool_service';
import controlTypeService from '../../../form/js/control_type_service';
/**
 *  列表的导出操作
 */

var operation= {
    name:"export",
    title:"导出",
    icon:"ios-download-outline",
    operationType:"common",
    btnType:"primary",
    security:["query"],
    entitySecurity:true,
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
function formatData(context,data){
    let metaEntity=context.metaEntity;
    let gridColumns=context.grid.innerColumns;
    let formattedData=[];
    let header=[];
    let exportFields=[];
    gridColumns.forEach(ele => {
        let key=ele.key;
        let metaField=metaEntity.findField(key);
        if(metaField){
            exportFields.push(key);
        }
    });
    for(let i=0;i<data.length;++i){
        let item=data[i];
        let formattedItem=[];
        exportFields.forEach(key => {
            if (item.hasOwnProperty(key)) {
                let metaField=metaEntity.findField(key);
                if(metaField){
                    if(i==0){
                        header.push(metaField.title);
                    }
                    let newValue=controlTypeService.formatDataForExport(item, metaField);
                    formattedItem.push(newValue);
                }
            }
        });
        if(i==0){
            formattedData.push(header.join(','));
        }
        formattedData.push(formattedItem.join(','));
    }
    return formattedData.join('\r\n');
}
function impl(context,$optInst){
    var grid=context.grid;
    if(!grid){
        contextHelper.error({content:`必须在m-grid组件使用`});
        return;
    }
    contextHelper.confirm({
        title: '提示',
        content: '是否导出当前列表所有数据?',
        onOk: () => {
            let ctx=_.cloneDeep(grid.currentQueryCtx),_p=null;
            ctx.currentPage=1;
            ctx.currentPageSize=grid.maxExportSize;
            if(grid.query){//外部指定了query，用外部的
                _p=grid.query(ctx,grid.queryResource);
            }else{
                //外部指定了查询地址，由此地址构造查询resource
                let _resource=grid.queryResource;
                if(grid.queryUrl){
                    _resource=contextHelper.buildResource(grid.queryUrl);
                }
                //默认存在元数据情况下，肯定是存在实体的queryResource的，而且是leap的后台，使用leap转换器
                _p= contextHelper.getMvueComponents().leapQueryConvertor.exec(_resource,ctx,(params)=>{
                    grid.beforeQuery&&grid.beforeQuery(params);
                });
            }
            _p.then(({data,total})=>{
                if(total>grid.maxExportSize){
                    contextHelper.warning({content:`已超过最大导出数据量${grid.maxExportSize}`});
                    return;
                }
                if(total==0){
                    contextHelper.warning({content:`数据为空，请确定所导出的数据源是否正确或者重设查询条件再导出`});
                    return;
                }
                let formattedData=formatData(context,data);
                ExportCsv.download(grid.metaEntity.title+".csv", formattedData);
            });
        }
    });
}
export default  operation





