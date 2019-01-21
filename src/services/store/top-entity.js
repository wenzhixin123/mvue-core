import context from "../../libs/context";
var cached={
    current:{
      entityName:"",
      value:""
    },
    topEntityRows:{}
};
cached.current=null;

var setter="core/setTopEntityRow";
var getter="core/getTopEntityRow";

export default {
    set(entityName,val){
        cached.current={
            entityName:entityName,
            value:val
        };
        context.getStore().commit(setter,`${cached.current.entityName}/${cached.current.value}`);
        cached.topEntityRows[entityName.toLowerCase()]=cached.current;
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
    },
    remove(){
        if(cached.current){
            delete cached.topEntityRows[cached.current.entityName.toLowerCase()];
            cached.current=null;
        }
        context.getStore().commit(setter,"");
    },
    get(){
        //let topEntityRow=appCtx.getStore().state.core.topEntityRow;
        if(cached.current){
            return cached.current;
        }
        return null;
    },
    getHistory(entityName){
        if(!entityName){
            return null;
        }
        var existItem=cached.topEntityRows[entityName.toLowerCase()];
        return existItem;
    }
}