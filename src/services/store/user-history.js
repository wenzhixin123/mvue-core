import context from "../../libs/context";
var store = require('store2');
var cached=defaultVal();

function defaultVal() {
    return {
        userId:"",
        entities:{},
        topEntity:null
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
    var sub="/__user_history__";
    return getWebContext()+sub;
}

function sendToStore() {
    try{
        cached.userId=context.getMvueToolkit().session.getCurrentUser().userId;
        store.set(getStoreKey(),cached);
    }catch (ex){
        console.warn("save history error:"+ex);
    }
}

function getFromStore() {
    try {
        return store.get(getStoreKey());
    }catch (ex){
        console.warn("read history error:"+ex);
        return null;
    }
}

export default {
    init(){
        cached=getFromStore();
        if(cached==null){
            cached=defaultVal();
        }
    },
    sendToStore(){
      sendToStore()
    },
    addEntity(entityName,val){
        var item={
            entityName:entityName,
            value:val
        };
        cached.entities[entityName.toLowerCase()]=item;
        return item;
    },
    removeEntity(entityName){
        delete cached.entities[entityName.toLowerCase()];
    },
    getByEntity(entityName){
        if(!entityName){
            return null;
        }
        if(cached.userId!=context.getMvueToolkit().session.getCurrentUser().userId) {
            cached=defaultVal();
            return null;
        }
        var existItem=cached.entities[entityName.toLowerCase()];
        return existItem;
    },
    setTopEntity(topEntity){
        cached.topEntity=topEntity;
    }
}