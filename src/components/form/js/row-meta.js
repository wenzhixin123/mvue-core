const rowMetaKey='__meta__';
const rowMetaIdKey='id';
const rowMetaTitleKey='title';
function getRowMetaData(rowData,fieldName){
    let metaData=rowData[rowMetaKey];
    if(metaData&&metaData.fields){
        let fieldsMeta=metaData.fields;
        let rowMetaData=fieldsMeta[fieldName];
        return rowMetaData;
    }
    return null;
}
//模拟构造不存在于数据库的引用数据
function rebuildRefData(vals,rowData,fieldName,refValField,refTitleField){
    let rowMetaData=getRowMetaData(rowData,fieldName);
    let refData=[];
    if(rowMetaData){
        if(_.isArray(rowMetaData)){
            let __t=[];
            rowMetaData.forEach(ele => {
                let _t={};
                _t[refValField]=ele[rowMetaIdKey];
                _t[refTitleField]=ele[rowMetaTitleKey];
                __t.push(_t);
            });
            refData = __t;
        }else{
            let _t={};
            _t[refValField]=rowMetaData[rowMetaIdKey];
            _t[refTitleField]=rowMetaData[rowMetaTitleKey];
            refData = [_t];
        }
    }
    if(refData.length<vals.length){
        let refDataMap=_.keyBy(refData,rd=>{
            return rd[refValField];
        })
        _.each(vals,val=>{
            //如果这条val的数据，不存在与__meta__中，构造一个假的
            if(!refDataMap.hasOwnProperty(val)){
                let _fake={};
                _fake[refValField]=val;
                _fake[refTitleField]=val;
                refData.push(_fake);
            }
        });
    }
    return refData;
}
//rowData是否包含fieldName的冗余数据
function has(rowData,fieldName){
    let metaData=rowData[rowMetaKey];
    return metaData&&metaData.fields&&metaData.fields.hasOwnProperty(fieldName);
}
function title(rowData,fieldName){
    let rowMetaData=getRowMetaData(rowData,fieldName);
    if(rowMetaData){
        if(_.isArray(rowMetaData)){
            let _t=[];
            rowMetaData.forEach(ele => {
                _t.push(ele[rowMetaTitleKey]);
            });
            return _t.join(',');
        }else{
            return rowMetaData[rowMetaTitleKey];
        }
    }
    return '';
}
function setRowMeta(rowData,fieldName,data){
    rowData[rowMetaKey]=rowData[rowMetaKey]||{fields:{}};
    rowData[rowMetaKey].fields[fieldName]=data;
}
export default {
    rebuildRefData,
    title,
    setRowMeta,
    has
}