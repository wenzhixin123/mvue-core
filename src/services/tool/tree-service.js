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

function visitTree(tree, processor, parent) {
    _.forEach(tree, function (node, index) {
        if (parent && _.isEmpty(node.parentId)) {
            node["parentId"] = parent.id;
        }
        if (processor) {
            let result = processor(node, tree, index,parent);
            if (result === false) {
                return false;
            }
        }
        if (node.children) {
            visitTree(node.children, processor, node);
        }
    });
}

export default{
    visitTree,
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
                let parentFilter="";
                if(opts.parentField){
                    //如果外部指定了父级查询的条件，用外部指定的代替
                    if(opts.rootFilters){
                        parentFilter=opts.rootFilters;
                    }else{
                        parentFilter=`${opts.parentField} is null `;
                    }
                }
                var queryOptions=buildQueryOptions(opts.queryOptions,parentFilter);
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
        opts=_.assign({},defaultVal,opts);
        var metaEntity=metabase.findMetaEntity(entityName);
        var titleField=metaEntity.firstTitleField();
        var idField=metaEntity.getIdField();
        var dataResource=this.buildDataResource(entityName,opts);
        let parentField=metaEntity.findField(opts.parentField || "parentId");
        if(parentField==null){
            opts.maxLevel=1;
        }
        return _.extend({
            labelField:titleField&&titleField.name,
            valueField:idField&&idField.name,
            dataResource:dataResource
        },opts);
    }
}
