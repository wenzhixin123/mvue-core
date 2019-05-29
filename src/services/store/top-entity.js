import context from "../../libs/context";
const uuidv1 = require('uuid/v1');
var store = require('store2');
var sidSetter="core/setSid";

function getWebContext() {
    var webContext=window.location.pathname;
    if(webContext.indexOf('/')>1){
        webContext=webContext.substring(0,webContext.lastIndexOf('/'));
    }
    return webContext;
}
function getStoreKey() {
    var sub="/__top_entity__";
    return getWebContext()+sub;
}
//从localStorage中获取缓存的topEntity数据
function getFromStore() {
    try {
        return store.get(getStoreKey());
    }catch (ex){
        console.warn("read top entity error:"+ex);
        return null
    }
}
//定义topEntity缓存数据
// {
//     sid1:{
//         current:null,//当前topEntity缓存数据，{entityName:"",value:""}
//         hist:{} //历史topEntity缓存数据
//     },
//     sid2:{
//         current:null,
//         hist:{}
//     }
// }
var cached=getFromStore();
if(cached==null){
    cached={};
}
/**
 * 从当前路由数据中获取topEntity会话标志sid
 */
function getSid(){
    let sid=context.getStore()&&context.getStore().getters['core/getSid']();
    if(!sid){
        let curVue=context.getCurrentVue();
        sid=curVue&&curVue.$route.query._sid;
    }
    return sid;
}
//将当前用户的topEntity数据缓存到localStorage
function sendToStore(pageSid) {
    try{
        //每次保存只保存当前会话sid的数据
        //1:先从localStorage读取最新的topEntity数据
        let _cached=getFromStore()||{};
        let _sid=getSid()||pageSid;
        //2:然后更新当前sid的topEntity数据
        _cached[_sid]=cached[_sid];
        if(_.isEmpty(_cached[_sid])){
            delete _cached[_sid];
        }
        store.set(getStoreKey(),_cached);
    }catch (ex){
        console.warn("save top entity error:"+ex);
    }
}
function getSidFromSessionStorage(){
    //每个会话存储一个唯一的sid，这样无论来回切换多少次菜单，都会复用这个sid，避免产生无限个sid
    let pageSid=sessionStorage.getItem("sid");
    if(!pageSid){
        pageSid=uuidv1();
        sessionStorage.setItem("sid",pageSid);
    }
    return pageSid;
}
export default {
    //每次应用启动时，清理过期的sid数据
    deleteExpired(){
        try{
            let _cached=getFromStore();
            let sidExpired=context.getSettings().sidExpired||1;
            if(_cached){
                let toDeletedSids=[];
                _.forIn(_cached,(cacheItem,__sid)=>{
                    if(cacheItem.mayExpired){
                        let mayExpiredStartDate=cacheItem.mayExpiredStartDate;
                        let end=new Date().getTime();
                        let duration=end-mayExpiredStartDate;
                        if(duration>sidExpired*24*60*60*1000){
                            toDeletedSids.push(__sid);
                        }
                    }
                });
                if(toDeletedSids.length>0){
                    toDeletedSids.forEach(__sid => {
                        delete _cached[__sid];
                    });
                    store.set(getStoreKey(),_cached);
                }
            }
        }catch (ex){
            console.warn("delete expired top entity error:"+ex);
        }
    },
    //浏览器tab关闭或者刷新时，标记此tab对应的sid数据可能被清除
    setMayExpired(){
        let _sid=sessionStorage.getItem("sid");
        if(_sid){
            let cachedItem=cached[_sid];
            if(cachedItem){
                cachedItem.mayExpired=true;
                cachedItem.mayExpiredStartDate=new Date().getTime();
                sendToStore();
            }
        }
    },
    /**
     * 设置topEntity数据
     * 1：保存到localStorage中，不仅有当前设置的，还有历史设置的topEntity数据
     */
    set(entityName,val){
        //每个会话存储一个唯一的sid，这样无论来回切换多少次菜单，都会复用这个sid，避免产生无限个sid
        let _sid=getSidFromSessionStorage();
        cached[_sid]=cached[_sid]||{current:null,hist:{}};
        let cachedItem=cached[_sid];
        if(cachedItem.hasOwnProperty('mayExpired')){
            delete cachedItem.mayExpired;
        }
        if(cachedItem.hasOwnProperty('mayExpiredStartDate')){
            delete cachedItem.mayExpiredStartDate;
        }
        cachedItem.current={
            entityName:entityName,
            value:val
        };
        //设置当前页面会话的sid，这个sid在每个路由跳转时重置，并会通过query参数传递到下一个路由
        context.getStore().commit(sidSetter,_sid);
        cachedItem.hist=cachedItem.hist||{};
        cachedItem.hist[entityName.toLowerCase()]=_.cloneDeep(cachedItem.current);
        sendToStore();
    },
    //set(entityName,val)的快捷方法
    setByString(str){
        var topEntityInfo=str.split("/");
        if(topEntityInfo.length==2){
            this.set(topEntityInfo[0],topEntityInfo[1]);
        }else{
            throw Error("topEntity format error:"+str);
        }
    },
    //请求第一次带着_sid过来，这时候应该是打开新的浏览器tab，需要从历史_sid中复制topEntity历史数据，
    //并产生新的页面会话sid，再次设置topEntity时，会丢弃这个旧的_sid，生成当前浏览器tab唯一的sid
    copyAndSetFromSid(_sid){
        let pageSid=getSidFromSessionStorage();
        let cachedItem=cached[_sid];
        if(cachedItem&&(!cached[pageSid])){
            cached[pageSid]=_.cloneDeep(cachedItem);
            sendToStore(pageSid);
        }
        return pageSid;
    },
    //清除所有topEntity数据
    removeAll(){
        let _sid=getSid();
        if(!_sid){
            return;
        }
        let cachedItem=cached[_sid];
        if(cachedItem){
            delete cached[_sid];
            sendToStore();
        }
    },
    removeCurrent(){
        let _sid=getSid();
        if(!_sid){
            return;
        }
        let cachedItem=cached[_sid];
        if(cachedItem&&cachedItem.current){
            cachedItem.current=null;
            sendToStore();
        }
    },
    /**
     * 移除当前实体的topEntity数据和历史数据
     * 1：清除localStorage中的当前topEntity数据
     * 2：清除localStorage中缓存的当前实体的历史topEntity数据
     */
    remove(){
        let _sid=getSid();
        if(!_sid){
            return;
        }
        let cachedItem=cached[_sid];
        if(cachedItem){
            if(cachedItem.current){
                delete cachedItem.hist[cachedItem.current.entityName.toLowerCase()];
                cachedItem.current=null;
                sendToStore();
            }
        }
    },
    //获取当前设置的entityName实体的topEntity数据
    get(entityName){
        let _sid=getSid();
        if(!_sid){
            return null;
        }
        let cachedItem=cached[_sid];
        if(cachedItem&&cachedItem.current){
            if(entityName && entityName.toLowerCase()!==cachedItem.current.entityName.toLowerCase()){
                return null;
            }
            return cachedItem.current;
        }
        return null;
    },
    //获取历史设置的entityName实体的topEntity数据
    //多个控件设置了topEntity后，各个控件可以从历史topEntity数据中自动填充默认值
    getHistory(entityName){
        if(!entityName){
            return null;
        }
        let _sid=getSid();
        if(!_sid){
            _sid=getSidFromSessionStorage();
            if(!_sid){
                return null;
            }
        }
        let cachedItem=cached[_sid];
        let hist=cachedItem&&cachedItem.hist;
        if(!hist){
            return null;
        }
        let cachedHistItem = hist[entityName.toLowerCase()];
        if(cachedHistItem){
            return cachedHistItem;
        }
        return null;
    },
    //loose为true时，还会从sessionStorage读取sid，否则在当前路由页面上下文读取
    getSid(loose){
        let _sid=getSid();
        if(loose&&!_sid){
            _sid=sessionStorage.getItem("sid");
        }
        return _sid;
    }
}