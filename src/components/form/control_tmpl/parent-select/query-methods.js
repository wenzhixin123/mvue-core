//合并两个数组，并根据key去重
function concatIgnoreDuplicated(firstArray,secondArray,key){
    firstArray=firstArray||[];
    secondArray=secondArray||[];
    var firstMap=_.keyBy(firstArray,o=>{
        return o[key];
    });
    _.each(secondArray,o=>{
        if(!firstMap[o[key]]){
            firstArray.push(o);
        }
    });
    return firstArray;
}
function build(entityResource,idField,titleField,parentField,comParams){
    return {
        queryRootEntity(){//查询根实体数据
            let qParams={filters:`${parentField} is null`};
            if(comParams.rootFilters){
                qParams.filters=comParams.rootFilters;
            }
            return entityResource.query(qParams).then(({data})=>{
                return data;
            });
        },
        queryEntityByParent(parentId){//查询子实体数据
            return entityResource.query({filters:`${parentField} eq ${parentId}`}).then(({data})=>{
                return data;
            });
        },
        queryEntityByKeyword(keyword,entityIds){//关键字查询实体数据
            var one = entityResource.query({filters:`${titleField} like '%${keyword}%'`});
            return new Promise((resolve,reject)=>{
                one.then(({data:dataOne})=>{
                    if(!_.isEmpty(entityIds)){
                        entityResource.query({filters:`${idField} in ${entityIds.join(',')}`}).then(({data:dataTwo})=>{
                            resolve(concatIgnoreDuplicated(dataOne,dataTwo,idField));
                        },()=>{
                            reject();
                        });
                    }else{
                        resolve(dataOne);
                    }
                },()=>{
                    reject();
                });
            });
        },
        queryEntityByIds(entityIds){//查询指定ids的实体数据
            return entityResource.query({filters:`${idField} in ${entityIds.join(',')}`}).then(({data})=>{
                return data;
            });
        }
    }
}
export default{
    build
}