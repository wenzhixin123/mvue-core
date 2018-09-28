import ExportCsv from "../../../grid/js/export_csv";
import contextHelper from "../../../../libs/context";
import metabase from "../../../../libs/metadata/metabase";
import toolServices from '../../../../services/tool/tool_service';

/**
 *  列表的导出操作
 */

var operation= {
    name:"export",
    title:"导出",
    icon:"ios-download-outline",
    operationType:"common",
    btnType:"primary",
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};

function impl(context,$optInst){
    var resource=context.grid&&context.grid.queryResource;
    var metaEntity=context.metaEntity;
    var grid=context.grid;
    if(_.isEmpty(resource) &&  !_.isEmpty(metaEntity)){
        resource=metaEntity.dataResource();
    }
    if(_.isEmpty(resource)){
        contextHelper.error({content:`实体查询地址未设置`});
        return;
    }
    contextHelper.confirm({
        title: '提示',
        content: '是否导出当前列表所有数据?',
        onOk: () => {
            var queryOptions={page_size:500};
            if(grid){
                queryOptions=grid.buildQueryOptions();
                queryOptions.page_size=grid.totalCount || queryOptions.page_size;
            }
            queryOptions.total=false;
            queryOptions.page=1;
            queryOptions.select="*";
            //获取当前项目的swagger地址
            metabase.currentSwagger(metaEntity.projectId).then(function(swagger){
                var exportTaskSetting={
                    "entityName":metaEntity.name,
                    "swagger":swagger,
                    "options":queryOptions
                };
                var metaEntity=metabase.findMetaEntity(metaEntity.name);
                var query={};
                if(grid){
                    query=grid.$route.query;
                }
                toolServices().doExport(query,exportTaskSetting).then(function (records) {
                    ExportCsv.download(metaEntity.title+".csv", records.body.join("\r\n"));
                });
            });
        }
    });
}
export default  operation





