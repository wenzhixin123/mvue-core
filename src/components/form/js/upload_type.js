//上传组件的相关定义
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
    },
    Portrait:{
        multiple:{
            isAllowed:false,//头像组件只能传一张图
            max:1//
        },
        limitSize:{
            limit:true,
            max:maxSize.picture
        },
        width:130,//头像宽度px
        height:150//头像高度px
    },
    SingleFileUpload:{
        multiple:{
            isAllowed:false,//是否允许上传多个文件
            max:1//最大文件个数，为空不限制
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
    SingleImageUpload:{
        multiple:{
            isAllowed:false,//是否允许上传多个文件
            max:1//最大文件个数，为空不限制
        },
        limitSize:{
            limit:true,
            max:maxSize.picture
        },
        width:130,//头像宽度px
        height:150//头像高度px
    },
    MultiFileUpload:{
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
    MultiImageUpload:{
        multiple:{
            isAllowed:true,//是否允许上传多个文件
            max:null//最大文件个数，为空不限制
        },
        limitSize:{
            limit:true,
            max:maxSize.picture
        }
    },
    Avatar:{
        multiple:{
            isAllowed:false,//头像组件只能传一张图
            max:1//
        },
        limitSize:{
            limit:true,
            max:maxSize.picture
        },
        width:130,//头像宽度px
        height:150//头像高度px
    }
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