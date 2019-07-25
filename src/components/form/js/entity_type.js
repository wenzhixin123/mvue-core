import metabase from '../../../libs/metadata/metabase';
import context from '../../../libs/context';
import rowMeta from './row-meta';
import _types from './_types';
const deletedFlag='__#deletedFlag#__';
//控制只能选到第几层,selectLevel大于0才有意义，否则不限制
const selectLevelProp={
    id:'selectLevel',
    inputType:_types.inputType.Number,
    default:0,
    min:0,
    store:_types.store.MetaFieldInputParams,
    title:'最高可选层级'
};
const props={
    RefEntity:_types.merge(_types.placeholder,_types.manyToOneRelation,_types.queryOptions),
    MultiRefEntity:_types.merge(_types.placeholder,Object.assign({},_types.manyToOneRelation,{id:'embeddedRelation'}),_types.queryOptions),
    ParentSelect:_types.merge(_types.manyToOneRelation,_types.queryOptions,selectLevelProp),
    OrderedMultiRefEntity:_types.merge(_types.placeholder,Object.assign({},_types.manyToOneRelation,{id:'embeddedRelation'}),_types.queryOptions)
};
var types={
    RefEntity:{ 
        id: "RefEntity", 
        title: "引用实体", 
        icon:"ios-search"
    },
    MultiRefEntity:{ 
        id: "MultiRefEntity", 
        title: "多选引用实体", 
        icon:"md-menu"
    },
    ParentSelect:{ 
        id: "ParentSelect", 
        title: "父选择器", 
        icon:"ios-search-outline"
    },
    OrderedMultiRefEntity:{ 
        id: "OrderedMultiRefEntity", 
        title: "有序多选引用实体", 
        icon:"ios-list"
    }
};
//设置控件属性定义，到控件基础定义上
_.forIn(types,(value,key)=>{
    value.props=props[key];
});
var componentParams={
    RefEntity:_types.getPropsDefault(props.RefEntity),
    MultiRefEntity:_types.getPropsDefault(props.RefEntity),
    ParentSelect:_types.getPropsDefault(props.RefEntity),
    OrderedMultiRefEntity:_types.getPropsDefault(props.RefEntity)
};
function accept(componentType){
    return !!types[componentType];
}
function formatData(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    var relation=metaField.manyToOneRelation||metaField.embeddedRelation;
    var expandData=item[relation.name];
    let targetEntity=metabase.findMetaEntity(relation.targetEntity);
    let titleField=targetEntity.firstTitleField().name;
    let hideDeleted=context.getSettings().control.refEntity.hideDeleted;
    //__forceMeta__用在批量编辑grid，标记使用__meta__冗余数据，因为此时expand数据不正确
    if(!titleField || ((item.__forceMeta__&&rowMeta.has(item,fieldName))||!expandData)){
        let rowMetaTitle= rowMeta.title(item,fieldName);
        if(!_.isNil(rowMetaTitle)){//冗余字段中有数据
            return rowMetaTitle;
        }else{//冗余字段中无数据，代表数据已经被删除
            if(hideDeleted){
                return "";
            }
            let res=null;
            if(_.isArray(origin)){
                let _a=[];
                _.forEach(origin,key=>{
                    _a.push(`${deletedFlag}${key}`);
                });
                res=_a.join(',');
            }else{
                res=`${deletedFlag}${origin}`;
            }
            return res;
        }
    }
    //有 expand Data 从expand中读取
    if(_.isArray(origin)){
        let idField=targetEntity.getIdField().name;
        let expandDataMap=_.keyBy(expandData,o=>{
            return o[idField];
        });
        let titleArray=[];
        _.each(origin,itemId=>{
            let ed=expandDataMap[itemId];
            if(ed){
                titleArray.push(ed[titleField]);
            }else{//expand数据没有，表示已经删除
                if(!hideDeleted){
                    titleArray.push(`${deletedFlag}${itemId}`);
                }
            }
        });
        return titleArray.join(',');
    }else{
        return expandData[titleField];
    }
}
function formatDataForExport(componentType,item,metaField){
    return formatData(componentType,item,metaField);
}
function fillComponentParams(formItem,metaField){
    var relation=metaField.manyToOneRelation||metaField.embeddedRelation;
    var itemEntityName=metaField.xAttrs&&metaField.xAttrs.targetEntity;
    var targetEntityName=null;
    if(relation){
        targetEntityName=relation.targetEntity;
    }else if(itemEntityName){
        targetEntityName=itemEntityName;
    }
    if(targetEntityName){
        let targetEntity=metabase.findMetaEntity(targetEntityName);
        if(targetEntity){
            let idField=targetEntity.getIdField();
            let titleField=targetEntity.firstTitleField();
            formItem.componentParams.entityId=targetEntityName;
            formItem.componentParams.idField=idField.name;
            formItem.componentParams.titleField=titleField?titleField.name:idField.name;
            formItem.componentParams.entityResourceUrl=targetEntity.dataResourceUrl();
        }else{
            console.log(`关系字段${metaField.name}的引用实体${targetEntity}不存在`);
        }
    }
}
export default{
    types:types,
    accept:accept,
    componentParams:componentParams,
    formatData:formatData,
    formatDataForExport,
    fillComponentParams:fillComponentParams,
    deletedFlag:deletedFlag
}