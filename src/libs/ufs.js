import ufsclient from 'ufs-client-js';
import context from './context';
import paths from './paths';
function getStorageClient(){
    let apiServer=context.getMvueToolkit().config.getConfigVal('service.ufs.endpoint');
    if(!_.startsWith(apiServer,'http')){
        const baseServiceRoot=context.getMvueToolkit().config.getConfigVal('service.base.endpoint');
        apiServer=paths.join(baseServiceRoot,apiServer);
    }
    let accessToken=context.getMvueToolkit().session.getToken();
    let storageClient = new ufs.StorageClient(apiServer, {
        accessToken: accessToken
    });
    return storageClient;
}
function upload(file,options){
    let storageClient=getStorageClient();
    return new Promise((resolve,reject)=>{
        //执行上传
        storageClient.upload({
            file: file
        },options).then((data) => {
            resolve(data);
        }).catch((err) => {
            reject(err);
        });
    });
}
function getDownloadUrl(fileId,fileName){
    let storageClient=getStorageClient();
    let params={
        fileId: fileId
    };
    if(fileName){
        params.responseHeaderOverrides={'Content-Disposition':`attachment; filename=${fileName}`};
    }
    return new Promise((resolve,reject)=>{
        storageClient.urlFor(params).then(urlInfo => {
            if(!_.startsWith(urlInfo.url,'http')){
                const baseServiceRoot=context.getMvueToolkit().config.getConfigVal('service.base.endpoint');
                urlInfo.url=paths.join(baseServiceRoot,urlInfo.url);
            }
            resolve(urlInfo);
        },(err)=>{
            reject(err);
        });
    });
}
export default {
    upload,
    getDownloadUrl
}