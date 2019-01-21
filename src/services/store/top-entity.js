import context from "../../libs/context";
var store = require('store2');
var cached=getFromStore();
if(cached==null){
    cached=defaultVal();
    cached.current=null;
}

var setter="core/setTopEntityRow";
var getter="core/getTopEntityRow";

function defaultVal() {
    return {
        current:{
            entityName:"",
            value:""
        },
        topEntityRows:{}
    };
}

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

function sendToStore() {
    try{
        cached.userId=context.getMvueToolkit().session.getCurrentUser().userId;
        store.set(getStoreKey(),cached);
    }catch (ex){
        console.warn("save top entity error:"+ex);
    }

}

function getFromStore() {
    try {
        return store.get(getStoreKey());
    }catch (ex){
        console.warn("read top entity error:"+ex);
        return null
    }
}

export default {
    set(entityName,val){
        cached.current={
            entityName:entityName,
            value:val
        };
        context.getStore().commit(setter,`${cached.current.entityName}/${cached.current.value}`);
        cached.topEntityRows[entityName.toLowerCase()]=cached.current;
        sendToStore();
        return cached.current;
    },
    setByString(str){
        var topEntityInfo=str.split("/");
        if(topEntityInfo.length!=2){
            this.set(topEntityInfo[0],topEntityInfo[1]);
        }else{
            throw "topEntity format error:"+str;
        }
    },
    clear(){
        cached.current=null;
        context.getStore().commit(setter,"");
        sendToStore();
    },
    remove(){
        if(cached.current){
            delete cached.topEntityRows[cached.current.entityName.toLowerCase()];
            cached.current=null;
        }
        context.getStore().commit(setter,"");
        sendToStore();
    },
    get(){
        //let topEntityRow=appCtx.getStore().state.core.topEntityRow;
        if(cached.userId!=context.getMvueToolkit().session.getCurrentUser().userId) {
            cached=defaultVal();
            return null;
        }
        if(cached.current){
            return cached.current;
        }
        return null;
    },
    getHistory(entityName){
        if(!entityName){
            return null;
        }
        if(cached.userId!=context.getMvueToolkit().session.getCurrentUser().userId) {
            cached=defaultVal();
            return null;
        }
        var existItem=cached.topEntityRows[entityName.toLowerCase()];
        return existItem;
    }
}