import ExportCsv from "../../../grid/js/export_csv";
import contextHelper from "../../../../libs/context";
import queryByBatches from "../../../../libs/query-by-batches";
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
                    if(!_.isEmpty(newValue)){
                        newValue=escapeForCSV(newValue);
                    }
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

function escapeForCSV(val) {
    return "\""+val.replace(/"/g,"\"\"")+"\"";
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
            let ctx=_.cloneDeep(grid.currentQueryCtx);
            let _resource=grid.queryResource;
            let _query=null;
            ctx.currentPage=1;
            ctx.currentPageSize=grid.$refs.listInst.total;
            if(grid.query){//外部指定了query，用外部的
                _query=grid.query;
            }else if(grid.queryUrl){
                _resource=contextHelper.buildResource(grid.queryUrl);
            }
            queryByBatches.exec(grid,ctx,grid.maxLocalSize,_resource,_query).then(({data,total})=>{
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





