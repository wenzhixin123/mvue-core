<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
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
                    <Button type="ghost" icon="ios-cloud-upload-outline">上传文件</Button>
                </Upload>
                <ul class="ivu-upload-list">
                    <li class="ivu-upload-list-file ivu-upload-list-file-finish" v-for="item in fileList()" :key="item.url">
                        <span @click="handlePreview(item)"><i class="ivu-icon ivu-icon-document"></i> {{item.name}}</span>
                        <span>{{humanFileSize(item.size)}}</span>
                        <i class="ivu-icon ivu-icon-ios-close-empty ivu-upload-list-remove" @click="handleRemove(item)"></i>
                    </li>
                </ul>
            </div>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
            <p class="colorGrey" v-text="fileDescription()"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
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
                        <Button type="ghost" icon="ios-cloud-upload-outline">上传文件</Button>
                    </Upload>
                    <ul class="ivu-upload-list">
                        <li class="ivu-upload-list-file ivu-upload-list-file-finish" v-for="item in fileList()" :key="item.url">
                            <span @click="handlePreview(item)"><i class="ivu-icon ivu-icon-document"></i> {{item.name}}</span>
                            <span>{{humanFileSize(item.size)}}</span>
                            <i class="ivu-icon ivu-icon-ios-close-empty ivu-upload-list-remove" @click="handleRemove(item)"></i>
                        </li>
                    </ul>
                    <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                    <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
                    <p class="colorGrey" v-text="fileDescription()"></p>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import uploadBase from '../js/upload_base';
export default {
    mixins: [controlBase,uploadBase],
    methods:{
        
    }
}
</script>
<style lang="scss" scoped>
    
</style>


