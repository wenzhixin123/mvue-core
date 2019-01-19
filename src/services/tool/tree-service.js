import metabase from "../../libs/metadata/metabase";

function concatIgnoreDuplicated(firstArray,secondArray,key='userId'){
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

function  buildQueryOptions(queryOptions,filters) {
    var cloned=_.cloneDeep(queryOptions);
    if(_.isEmpty(filters)){
        return cloned;
    }
    if(_.isEmpty(cloned.filters)){
        cloned.filters=filters;
    }else{
        cloned.filters+=` and (${filters})`;
    }
    return cloned;
}

export default{
    buildDataResource:function (entityName,opts) {
        var opts=_.extend({
            parentField:"parentId",
            queryOptions:{
                filters:""
            }
        },opts);
        var metaEntity=metabase.findMetaEntity(entityName);
        var parentField=metaEntity.findField(opts.parentField);
        if(parentField==null){
             opts.parentField=null;
        }
        var dataResource=metaEntity.dataResource();
        var titleField=metaEntity.firstTitleField();
        var idField=metaEntity.getIdField();
        return {
            queryRoot() {
                var queryOptions=buildQueryOptions(opts.queryOptions,`${opts.parentField} is null `);
                if(opts.parentField==null){
                    var queryOptions=buildQueryOptions(opts.queryOptions,null);
                }
                return dataResource.query(queryOptions).then(({data}) => {
                    return data;
                });
            },
            queryByParent(parentId) {
                var queryOptions=buildQueryOptions(opts.queryOptions,`${opts.parentField} eq ${parentId}`);
                return dataResource.query(queryOptions).then(({data}) => {
                    return data;
                });
            },
            queryByKeyword(keyword, existedIds) {
                var queryOptions=buildQueryOptions(opts.queryOptions,`${titleField} like '%${keyword}%'`);
                var one = dataResource.query(queryOptions);
                return new Promise((resolve, reject) => {
                    one.then(({data: dataOne}) => {
                        if (!_.isEmpty(existedIds)) {
                            dataResource.query({filters: `${idField} in ${existedIds.join(',')}`}).then(({data: dataTwo}) => {
                                resolve(concatIgnoreDuplicated(dataOne, dataTwo, idField));
                            }, () => {
                                reject();
                            });
                        } else {
                            resolve(dataOne);
                        }
                    }, () => {
                        reject();
                    });
                });
            },
            queryByIds(ids) {
                return dataResource.query({filters: `${idField} in ${ids.join(',')}`}).then(({data}) => {
                    return data;
                });
            }
        }
    },
    build:function (entityName,opts,defaultVal) {
        var metaEntity=metabase.findMetaEntity(entityName);
        var titleField=metaEntity.firstTitleField();
        var idField=metaEntity.getIdField();
        var dataResource=this.buildDataResource(entityName,opts);
        return _.extend({
            labelField:titleField&&titleField.name,
            valueField:idField&&idField.name,
            dataResource:dataResource
        },defaultVal||opts);
    }
}