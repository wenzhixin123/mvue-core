import ufs from "../../../../libs/ufs";
function oldFileRealUrl(url,uploadBasePath){
    if(_.startsWith(url,"http://")||_.startsWith(url,"https://")){
        return url;
    }
    return `${uploadBasePath}?filePath=${url}`;
}
function fileRealUrl(item,uploadBasePath){
    return new Promise((resolve,reject)=>{
        if(!item){
            reject();
            return;
        }
        if(item.id){
            ufs.getDownloadUrl(item.id,item.name).then(res=>{
                resolve(res.url);
            },(err)=>{reject(err);});
        }else if(item.url){
            let url=oldFileRealUrl(item.url,uploadBasePath);
            resolve(url);
        }
    });
}
function download(item,uploadBasePath){
    fileRealUrl(item,uploadBasePath).then(previewUrl=>{
        window.open(previewUrl,"_blank");
    });
}
export default {
    fileRealUrl,
    download
}