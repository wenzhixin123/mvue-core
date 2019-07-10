import  context from "../context";
let CacheKeyForFind="__entity_cache_key_for_find";
let CacheKeyForQueue="__entity_cache_key_for_queue";

function getPageCache(key) {
    let cache=context.getPageCache()[key];
    if(!cache){
        cache={};
        context.getPageCache()[key]=cache;
    }
    return cache;
}

function getCacheForFind() {
    return getPageCache(CacheKeyForFind);
}

function getTaskQueue(key) {
    let taskQueue=getPageCache(CacheKeyForQueue);
    if(!_.has(taskQueue,key)){
        taskQueue[key]={};
    }
    return taskQueue[key];
}

function addOrCreateTask(key,handler) {
    let taskQueue=getPageCache(CacheKeyForQueue);
    if(!_.has(taskQueue,key)){
        taskQueue[key]=handler();
    }
    return taskQueue[key];
}

function findByEntity(metaEntity,id) {
    let entityCache=getCacheForFind();
    let itemCacheKey=metaEntity.name+"_"+id;
    if(_.has(entityCache,itemCacheKey)){
        return Promise.resolve(entityCache[itemCacheKey]);
    }
    return addOrCreateTask(itemCacheKey,()=>{
        return metaEntity.dataResource().get({id:id}).then(({data})=>{
            entityCache[itemCacheKey]=data;
            return data;
        });
    });
}

export default {
    find(metaEntity,id){
        return findByEntity(metaEntity,id);
    }
}
