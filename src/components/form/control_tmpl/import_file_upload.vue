<template>
    <div style="margin-bottom:0px;width:220px;margin-left:auto;margin-right:auto;">
        <div>
            <Upload ref="upload"
                :show-upload-list="false"
                :on-success="handleSuccess"
                :on-exceeded-size="handleExceededSize"
                :on-format-error="handleFormatError"
                :on-error="handleError"
                :before-upload="handleBeforeUpload"
                :default-file-list="defaultList"
                :format="allowedFormats"
                :max-size="maxSize*1024"
                :multiple="formItem.componentParams.multiple.isAllowed"
                name="file"
                :action="uploadAction">
                <Button type="primary" style="padding-left: 36px;padding-right: 56px;">{{buttonText()}}</Button>
            </Upload>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
        </div>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import uploadBase from '../js/upload_base';
export default {
    mixins: [controlBase,uploadBase],
    methods:{
        buttonText(){
            let fileLength=this.fileList().length;
            if(fileLength===0){
                return `上传文件(${this.sizeInfo()})`;
            }else{
                let file=this.fileList()[0];
                return `${file.name}(${this.humanFileSize(file.size)})`;
            }
        }
    }
}
</script>


