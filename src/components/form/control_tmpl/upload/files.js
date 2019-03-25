import ufs from "../../../../libs/ufs";
import context from "../../../../libs/context";
function oldFileRealUrl(url,uploadBasePath){
    if(_.startsWith(url,"http://")||_.startsWith(url,"https://")){
        return url;
    }
    return `${uploadBasePath}?filePath=${url}`;
}
function pathsJoin(...args){
    let paths=[];
    let firstStartsWithSlash=false;
    if(args.length>0){
        firstStartsWithSlash=args[0].startsWith('/');
    }
    for (let el of args) {
        let t=el;
        if(el.endsWith('/')){
            t= el.substr(0,el.length-1);
        }else if(el.startsWith('/')){
            t= el.substr(1,el.length);
        }
        paths.push(t);
    }
    let _path= paths.join('/');
    return firstStartsWithSlash?`/${_path}`:_path;
}
function fileRealUrl(item,uploadBasePath){
    return new Promise((resolve,reject)=>{
        if(!item){
            reject();
            return;
        }
        if(item.id){
            ufs.getDownloadUrl(item.id,item.name).then(res=>{
                if(!res.url.startsWith('http')){
                    //let baseUrl=context.getMvueToolkit().config.getApiBaseUrl();
                    let baseUrl="";
                    resolve(pathsJoin(baseUrl,res.url));
                }else{
                    resolve(res.url);
                }
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
    download,
    pathsJoin
}