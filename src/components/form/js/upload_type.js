//上传组件的相关定义
//定义基础组件:上传类型基础组件定义
var uploadTypes={
    FileUpload:{ 
        id: "FileUpload", 
        title: "文件上传", 
        icon:"ivu-icon ivu-icon-ios-upload-outline"
    },
    PictureUpload:{ 
        id: "PictureUpload", 
        title: "图片上传", 
        icon:"ivu-icon ivu-icon-image"
    }
};
var maxSize={
    picture:50,//图片最大50M这里以兆(M)为单位
    file:1024//文件最大1024M这里以兆(M)为单位
};
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
//上传相关组件的扩展参数定义
var componentParams={
    FileUpload:{
        multiple:{
            isAllowed:true,//是否允许上传多个文件
            max:null//最大文件个数，为空不限制
        },
        limitFileType:{
            limit:false,
            documentsIds:[],//文档类型允许的文件后缀列表id，为空表示不限制
            zipsIds:[],//压缩类型类型允许的文件后缀列表id，为空表示不限制
            fileTypes:[],//允许的文件后缀列表，由documentsIds和zipsIds定义的类型id转换而来
        },
        limitSize:{
            limit:true,
            max:maxSize.file
        }
    },
    PictureUpload:{
        multiple:{
            isAllowed:true,//是否允许上传多个文件
            max:null//最大文件个数，为空不限制
        },
        limitSize:{
            limit:true,
            max:maxSize.picture
        }
    }
};
//判断是否上传相关组件
function accept(componentType){
    return !!uploadTypes[componentType];
}
function isFileUpload(componentType){
    return componentType===uploadTypes.FileUpload.id;
}
function isPictureUpload(componentType){
    return componentType===uploadTypes.PictureUpload.id;
}
export default {
    types:uploadTypes,
    uploadFilters:uploadFilters,
    componentParams:componentParams,
    accept:accept,
    isPictureUpload:isPictureUpload,
    isFileUpload:isFileUpload,
    maxSize:maxSize
}