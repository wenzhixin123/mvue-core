import constants from '../../js/constants';
import context from '../../../../libs/context';
function getUserIdField(){
    return context.getSettings().control.userSelect.idField;
};
function getUserTitleField(){
    return context.getSettings().control.userSelect.nameField;
};
function getUserOrgField(){
    return context.getSettings().control.userSelect.orgField;
};
function getOrgIdField(){
    return context.getSettings().control.orgSelect.idField;
};
function getOrgParentField(){
    return context.getSettings().control.orgSelect.parentField;
};
function getOrgTitleField(){
    return context.getSettings().control.orgSelect.nameField;
};
var orgResource=null;
function orgService(){
    if(!orgResource){
        let orgUrl=constants.paths().orgApiUrl;
        orgResource= context.buildResource(orgUrl);
    }
    return orgResource;
};
var userResource=null;
function userService(){
    if(!userResource){
        let userUrl=constants.paths().userApiUrl;
        userResource=context.buildResource(userUrl);
    }
    return userResource;
};
//查询根部门
function queryRootOrg(){
    return orgService().query({filters:`${getOrgParentField()} is null`}).then(({data})=>{
        return data;
    });
}
//查询子部门
function queryOrgByParent(parentId){
    return orgService().query({filters:`${getOrgParentField()} eq ${parentId}`}).then(({data})=>{
        return data;
    });
}
//关键字查询部门
function queryOrgByKeyword(keyword,orgIds){
    var one = orgService().query({filters:`${getOrgTitleField()} like '%${keyword}%'`});
    return new Promise((resolve,reject)=>{
        one.then(({data:dataOne})=>{
            if(!_.isEmpty(orgIds)){
                orgService().query({filters:`${getOrgIdField()} in ${orgIds.join(',')}`}).then(({data:dataTwo})=>{
                    resolve(concatIgnoreDuplicated(dataOne,dataTwo,getOrgIdField()));
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
}
//查询指定ids的部门
function queryOrgByIds(orgIds){
    return orgService().query({filters:`${getOrgIdField()} in ${orgIds.join(',')}`}).then(({data})=>{
        return data;
    });
}
//合并两个数组，并根据userId去重
function concatIgnoreDuplicated(firstArray,secondArray,key){
    key=key||getUserIdField();
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
//关键字查询用户,如果userIds不为空，需要附加userIds代表的用户
function queryUserByKeyword(keyword,userIds){
    var one = userService().query({filters:`${getUserTitleField()} like '%${keyword}%'`});
    return new Promise((resolve,reject)=>{
        one.then(({data:usersOne})=>{
            if(!_.isEmpty(userIds)){
                userService().query({filters:`${getUserIdField()} in ${userIds.join(',')}`}).then(({data:usersTwo})=>{
                    //usersTwo如果包含在usersOne中，去重
                    resolve(concatIgnoreDuplicated(usersOne,usersTwo));
                },()=>{
                    reject();
                });
            }else{
                resolve(usersOne);
            }
        },()=>{
            reject();
        });
    });
}
//查询指定ids的用户
function queryUserByIds(userIds){
    return userService().query({filters:`${getUserIdField()} in ${userIds.join(',')}`}).then(({data})=>{
        return data;
    });
}
//按部门分页搜索用户
function pageQueryUserByOrg(orgIds,userIds,pageParams){//{page:1,pageSize:10}
    var filters='';
    if(!_.isEmpty(orgIds)){
        filters=`${getUserOrgField()} in '${orgIds.join(',')}'`;
    }
    var one = userService().query({total:true,page:pageParams.page,page_size:pageParams.pageSize,filters:filters});
    return new Promise((resolve,reject)=>{
        one.then(res=>{
            var total=_.toSafeInteger(res.headers['x-total-count'])||res.data.length;
            var usersOne=res.data;
            if(!_.isEmpty(userIds)){
                userService().query({filters:`${getUserIdField()} in '${userIds.join(',')}'`}).then(({data:usersTwo})=>{
                    //usersTwo如果包含在usersOne中，去重
                    resolve({
                        data:concatIgnoreDuplicated(usersOne,usersTwo),
                        total:total
                    });
                },()=>{
                    reject();
                });
            }else{
                resolve({
                    data:usersOne,
                    total:total
                });
            }
        },()=>{
            reject();
        });
    });
}
//关键字分页搜索用户
function pageQueryUserByKeyword(queryKeyword,userIds,pageParams){//{page:1,pageSize:10}
    var filters=`${getUserTitleField()} like '%${queryKeyword}%'`;
    var one = userService().query({total:true,page:pageParams.page,page_size:pageParams.pageSize,filters:filters});
    return new Promise((resolve,reject)=>{
        one.then(res=>{
            var total=_.toSafeInteger(res.headers['x-total-count'])||res.data.length;
            var usersOne=res.data;
            if(!_.isEmpty(userIds)){
                userService().query({filters:`${getUserIdField()} in '${userIds.join(',')}'`}).then(({data:usersTwo})=>{
                    //usersTwo如果包含在usersOne中，去重
                    resolve({
                        data:concatIgnoreDuplicated(usersOne,usersTwo),
                        total:total
                    });
                },()=>{
                    reject();
                });
            }else{
                resolve({
                    data:usersOne,
                    total:total
                });
            }
        },()=>{
            reject();
        });
    });
}
export default{
    queryRootOrg,
    queryOrgByParent,
    queryOrgByKeyword,
    queryOrgByIds,
    queryUserByKeyword,
    queryUserByIds,
    pageQueryUserByOrg,
    pageQueryUserByKeyword
}