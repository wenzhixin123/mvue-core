<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(defaultList)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <ul class="ivu-upload-list">
                    <li class="ivu-upload-list-file ivu-upload-list-file-finish" style="padding-left:0px;" v-for="item in defaultList" :key="item.url">
                        <span @click="handlePreview(item)"><i class="ivu-icon ivu-icon-document"></i> {{item.name}}</span>
                        <span>{{humanFileSize(item.size)}}</span>
                    </li>
                </ul>
            </div>
        </template>
        <template v-else>
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
                    <Button  icon="ios-cloud-upload-outline">上传文件</Button>
                </Upload>
                <ul class="ivu-upload-list">
                    <li class="ivu-upload-list-file ivu-upload-list-file-finish" v-for="item in fileList()" :key="item.url">
                        <span @click="handlePreview(item)"><i class="ivu-icon ivu-icon-document"></i> {{item.name}}</span>
                        <span>{{humanFileSize(item.size)}}</span>
                        <i class="ivu-icon ivu-icon-ios-close-empty ivu-upload-list-remove" @click="handleRemove(item)"></i>
                    </li>
                </ul>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import uploadBase from '../js/upload_base';
export default {
    mixins: [controlBase,uploadBase]
}
</script>
<style lang="scss" scoped>
    
</style>


