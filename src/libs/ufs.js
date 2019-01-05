import ufsclient from 'ufs-client-js';
import context from './context';
function getStorageClient(){
    let apiServer=context.getMvueToolkit().config.getConfigVal('service.ufs.endpoint');
    let accessToken=context.getMvueToolkit().session.getToken();
    let storageClient = new ufs.StorageClient(apiServer, {
        accessToken: accessToken
    });
    return storageClient;
}
function upload(file){
    let storageClient=getStorageClient();
    return new Promise((resolve,reject)=>{
        //执行上传
        storageClient.upload({
            file: file
        }).then((data) => {
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