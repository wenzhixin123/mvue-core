import uploadType from './upload_type';
var filesize = require('file-size');
export default {
    props: {
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    data:function(){
        return {
            uploadAction:"",
            defaultList:[],
            uploaded:false,//表示用户是否操作过上传组件
            currentUploadFileSum:0,//当前正在上传的文件个数
            oldFileList:[]//如果文件格式或者大小校验不合法，需要还原之前的文件
        };
    },
    computed:{
        allowedFormats:function(){
            var isPicture=this.isPicture();
            if(isPicture){
                let fileTypes=[];
                _.each(uploadType.uploadFilters.pictures,function(picItem){
                    fileTypes=fileTypes.concat(picItem.value);
                });
                return fileTypes;
            }
            if(this.formItem.componentParams.limitFileType
                &&this.formItem.componentParams.limitFileType.limit
                &&this.formItem.componentParams.limitFileType.fileTypes){
                return this.formItem.componentParams.limitFileType.fileTypes;
            }
            return [];
        },
        maxSize:function(){
            var max=0;
            if(uploadType.isPictureUpload(this.formItem.componentType)){
                max=uploadType.maxSize.picture;
            }else{
                max=uploadType.maxSize.file;
            }
            if(this.formItem.componentParams.limitSize.limit
                &&this.formItem.componentParams.limitSize.max
                &&this.formItem.componentParams.limitSize.max<max){
                    max=this.formItem.componentParams.limitSize.max;
            }
            return max;
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _oldValidPart=[];
            if(oldV&&oldV.length){
                _.each(oldV,function(oldFile){
                    _oldValidPart.push({name:oldFile.name,url:oldFile.url});
                });
            }
            if(this.uploaded){
                return;
            }
            if(!_.isEqual(newV,_oldValidPart)){
                this.defaultList=_.cloneDeep(newV)||[];
            }
        }
    },
    mounted () {
        if(!_.isEmpty(this.value)){
            this.defaultList=_.cloneDeep(this.value);
        }
    },
    methods:{
        humanFileSize:function(fileSize){
            fileSize=fileSize||0;
            return filesize(fileSize).human('jedec');//si,jedec
        },
        isPicture:function(){
            return uploadType.isPictureUpload(this.formItem.componentType);
        },
        formatInfo:function(){
            var isPicture=this.isPicture();
            var formatInfo="";
            if(this.allowedFormats&&this.allowedFormats.length){
                formatInfo+="支持"+this.allowedFormats.join(",")+"等";
            }
            if(formatInfo){
                if(isPicture){
                    formatInfo+="图片格式"
                }else{
                    formatInfo+="文件格式"
                }
            }
            return formatInfo;
        },
        sizeInfo:function(){
            var sizeInfo="不超过"+this.maxSize+"M";
            return sizeInfo;
        },
        fileDescription:function(){
            var formatInfo=this.formatInfo();
            var sizeInfo=this.sizeInfo();
            return formatInfo?`${formatInfo},${sizeInfo}`:sizeInfo;
        },
        fileList:function(){
            if(this.$refs.upload){
                return this.$refs.upload.fileList;
            }else{
                return [];
            }
        },
        fileRealUrl:function(url){
            return `${this.paths.uploadUrl}?filePath=${url}`;
        },
        emitValue:function(){
            this.uploaded=true;
            let _uploadList=[];
            _.each(this.$refs.upload.fileList,function(uploadFile){
                _uploadList.push({
                    name:uploadFile.name,
                    url:uploadFile.url,
                    size:uploadFile.size
                });
            });
            this.$emit("input",_uploadList);
        },
        minusCurrentFileSum:function(){
            //多文件上传，上传完后，当前待上传的总数减一
            if(this.formItem.componentParams.multiple.isAllowed){
                this.currentUploadFileSum=this.currentUploadFileSum-1;
            }
        },
        handleSuccess (res, file) {
            file.url =  res.file.relativePath;
            //单文件上传，直接覆盖旧的文件
            if(!this.formItem.componentParams.multiple.isAllowed){
                this.$refs.upload.fileList=[file];
            }
            this.minusCurrentFileSum();
            this.emitValue();
        },
        handleExceededSize:function(file,fileList){
            this.$refs.upload.fileList=_.cloneDeep(this.oldFileList);
            this.minusCurrentFileSum();
            var sizeInfo=this.sizeInfo();
            iview$Message.info(`大小超过限制,${sizeInfo}`);
        },
        handleFormatError:function(file,fileList){
            this.$refs.upload.fileList=_.cloneDeep(this.oldFileList);
            this.minusCurrentFileSum();
            var formatInfo=this.formatInfo();
            iview$Message.info(`格式错误,${formatInfo}`);
        },
        handleError:function(error,file){
            console.log(error);
            console.log(file);
            this.minusCurrentFileSum();
            iview$Message.info("上传失败，请联系管理员");
        },
        handleBeforeUpload () {
            this.currentUploadFileSum=this.currentUploadFileSum+1;
            var _this=this;
            this.uploadAction=this.paths.uploadUrl;
            var ok=true;
            this.oldFileList=_.cloneDeep(this.$refs.upload.fileList);
            //单文件上传，直接覆盖旧的图片
            if(!this.formItem.componentParams.multiple.isAllowed){
                this.$refs.upload.fileList=[];
            }else{
                //多文件上传，校验图片个数
                let _max=this.formItem.componentParams.multiple.max;
                if(this.formItem.componentParams.multiple.isAllowed&&_max){
                    let check = (this.$refs.upload.fileList.length+this.currentUploadFileSum) <= _max;
                    if (!check) {
                        this.minusCurrentFileSum();
                        let isPicture=this.isPicture();
                        iview$Message.info(`最多只能上传 ${_max} ${isPicture?'张图片':'个文件'}。`);
                    }
                    ok=check;
                }
            }
            return new Promise(function (resolve, reject) {
                if(ok){
                    _this.$nextTick(function(){
                        resolve();
                    });
                }else{
                    reject();
                }
            });
        },
        handleRemove (file) {
            //TODO 真实的删除
            // 从 upload 实例删除数据
            let fileList = this.$refs.upload.fileList;
            this.$refs.upload.fileList.splice(fileList.indexOf(file), 1);
            this.emitValue();
        },
        handlePreview(file){
            let previewUrl = this.fileRealUrl(file.url);
            window.open(previewUrl,"_blank");
        }
    }
}