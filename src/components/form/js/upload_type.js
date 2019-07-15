//上传组件的相关定义
import _types from './_types';

//定义上传的基本文件后缀类型
var uploadFilters={
    documents:[
        {id:"text",value:["text"]},
        {id:"doc/docx",value:["doc","docx"]},
        {id:"xls/xlsx",value:["xls","xlsx"]},
        {id:"ppt/pptx",value:["ppt","pptx"]},
        {id:"html/htm",value:["html","htm"]},
        {id:"pdf",value:["pdf"]}
    ],
    pictures:[
        {id:"jpg",value:["jpg","jpeg"]},
        {id:"png",value:["png"]},
        {id:"gif",value:["gif"]},
        {id:"bmp",value:["bmp"]},
        {id:"ico",value:["ico"]},
    ],
    zips:[
        {id:"zip",value:["zip"]},
        {id:"rar",value:["rar"]},
        {id:"7z",value:["7z"]},
    ]
};

const uploadMax={
    id:'uploadMax',
    inputType:_types.inputType.Number,
    default:null,
    store:_types.store.MetaFieldInputParams,
    title:'最大文件个数'
};
const allowedFormats={
    id:'allowedFormats',
    inputType:_types.inputType.Json,
    default:[],//允许的文件后缀列表，由documentsIds和zipsIds定义的类型id转换而来
    store:_types.store.MetaFieldInputParams,
    title:'文件类型'
};
const Size={
    picture:50,//图片最大50M这里以兆(M)为单位
    file:1024//文件最大1024M这里以兆(M)为单位
};
const maxSize={
    id:'maxSize',
    inputType:_types.inputType.Number,
    min:0,
    default:Size.file,
    store:_types.store.MetaFieldInputParams,
    title:'文件最大(M)'
};
const width={
    id:'width',
    inputType:_types.inputType.Number,
    default:130,
    min:1,
    store:_types.store.MetaFieldInputParams,
    title:'宽(px)'
};
const height={
    id:'height',
    inputType:_types.inputType.Number,
    default:150,
    min:1,
    store:_types.store.MetaFieldInputParams,
    title:'高(px)'
};
const props={
    Avatar:_types.merge(Object.assign({},maxSize,{default:Size.picture}),width,height),
    SingleImageUpload:_types.merge(Object.assign({},maxSize,{default:Size.picture}),width,height),
    MultiImageUpload:_types.merge(Object.assign({},maxSize,{default:Size.picture})),
    SingleFileUpload:_types.merge(maxSize,allowedFormats),
    MultiFileUpload:_types.merge(maxSize,allowedFormats)
};
//定义基础组件:上传类型基础组件定义
var uploadTypes={
    FileUpload:{ 
        id: "FileUpload", 
        title: "文件上传", 
        hidden:true 
    },
    PictureUpload:{ 
        id: "PictureUpload", 
        title: "图片上传", 
        hidden:true 
    },
    Portrait:{ 
        id: "Portrait", 
        title: "头像", 
        hidden:true 
    },
    Avatar:{ 
        id: "Avatar", 
        title: "头像", 
        icon:"ios-contact-outline"
    },
    SingleImageUpload:{ 
        id: "SingleImageUpload", 
        title: "单图片上传", 
        icon:"md-image"
    },
    SingleFileUpload:{ 
        id: "SingleFileUpload", 
        title: "单文件上传", 
        icon:"ios-document-outline"
    },
    MultiImageUpload:{ 
        id: "MultiImageUpload", 
        title: "多图片上传", 
        icon:"md-images"
    },
    MultiFileUpload:{ 
        id: "MultiFileUpload", 
        title: "多文件上传", 
        icon:"ios-paper-outline"
    }
};
//设置控件属性定义，到控件基础定义上
_.forIn(uploadTypes,(value,key)=>{
    value.props=props[key];
});
//上传相关组件的扩展参数定义
var componentParams={
    FileUpload:_types.getPropsDefault(props.MultiFileUpload),
    PictureUpload:_types.getPropsDefault(props.MultiImageUpload),
    Portrait:_types.getPropsDefault(props.Avatar),
    SingleFileUpload:_types.getPropsDefault(props.SingleFileUpload),
    SingleImageUpload:_types.getPropsDefault(props.SingleImageUpload),
    MultiFileUpload:_types.getPropsDefault(props.MultiFileUpload),
    MultiImageUpload:_types.getPropsDefault(props.MultiImageUpload),
    Avatar:_types.getPropsDefault(props.Avatar)
};
//判断是否上传相关组件
function accept(componentType){
    return !!uploadTypes[componentType];
}
function isFileUpload(componentType){
    return componentType===uploadTypes.FileUpload.id||componentType===uploadTypes.MultiFileUpload.id||componentType===uploadTypes.SingleFileUpload.id;
}
function isPictureUpload(componentType){
    return componentType===uploadTypes.PictureUpload.id||componentType===uploadTypes.Portrait.id
            ||componentType===uploadTypes.SingleImageUpload.id
            ||componentType===uploadTypes.MultiImageUpload.id||componentType===uploadTypes.Avatar.id;
}
function formatDataForExport(componentType,item,metaField){
    let fieldName=metaField.name;
    let origin=item[fieldName];
    if(_.isNil(origin)||origin===''){
        return "";
    }
    if(_.isArray(origin)){
        let names=[];
        origin.forEach(item => {
            names.push(item.name);
        });
        return names.join(',')
    }else{
        return origin.name;
    }
}
export default {
    types:uploadTypes,
    uploadFilters:uploadFilters,
    componentParams:componentParams,
    accept:accept,
    isPictureUpload:isPictureUpload,
    isFileUpload:isFileUpload,
    maxSize:maxSize,
    formatDataForExport
}