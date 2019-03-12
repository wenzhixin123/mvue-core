import context from '../../libs/context';
const prefix='$imp/entities/{entityName}';
var customActions = {
    prepareImport2:{method: 'POST', url: prefix+'/upload_prepare'},
    executeImportRows2:{method: 'POST', url: prefix+'/import_rows'}
};
var srvs=null;
export  default function () {
    if (srvs != null) {
        return srvs;
    }
    const baseServiceRoot = context.getMvueToolkit().config.getApiBaseUrl();
    let $resource = context.buildResource('prefix', customActions, {root: baseServiceRoot});
    srvs={
        prepareImport2: $resource.prepareImport2,
        executeImportRows2: $resource.executeImportRows2
    }
    return srvs;
}