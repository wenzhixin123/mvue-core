<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
            <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
            <div>
                <div class="demo-upload-list" v-for="item in fileList()" :key="item.url">
                    <div v-if="item.status === 'finished'">
                        <img :src="fileRealUrl(item.url)">
                        <div class="demo-upload-list-cover">
                            <i class="ivu-icon ivu-icon-ios-eye-outline" @click="handleView(item.url)"></i> 
                            <i class="ivu-icon ivu-icon-ios-trash-outline" @click="handleRemove(item)"></i>
                        </div>
                    </div>
                    <div v-else>
                        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                    </div>
                </div>
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
                    type="drag"
                    name="image"
                    :action="uploadAction"
                    style="display: inline-block;width:58px;">
                    <div style="width: 58px;height:58px;line-height: 58px;">
                        <Icon type="camera" size="20"></Icon>
                    </div>
                </Upload>
                <Modal title="查看图片" v-model="visible">
                    <img class="preview-img" :src="previewImgSrc" v-if="visible">
                </Modal>
            </div>
            <span class="colorRed" v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
            <p class="colorGrey" v-text="fileDescription()"></p>
        </div>
        <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal" class="form-horizontal">
            <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2" :style="{width:labelWidth}"></label>
                <div class="col-md-10" :style="{width:controlWidth}">
                    <div class="demo-upload-list" v-for="item in fileList()" :key="item.url">
                        <div v-if="item.status === 'finished'">
                            <img :src="fileRealUrl(item.url)">
                            <div class="demo-upload-list-cover">
                                <i class="ivu-icon ivu-icon-ios-eye-outline" @click="handleView(item.url)"></i> 
                                <i class="ivu-icon ivu-icon-ios-trash-outline" @click="handleRemove(item)"></i>
                            </div>
                        </div>
                        <div v-else>
                            <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                        </div>
                    </div>
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
                        type="drag"
                        name="image"
                        :action="uploadAction"
                        style="display: inline-block;width:58px;">
                        <div style="width: 58px;height:58px;line-height: 58px;">
                            <Icon type="camera" size="20"></Icon>
                        </div>
                    </Upload>
                    <Modal class="preview-img" title="查看图片" v-model="visible">
                        <img :src="previewImgSrc" v-if="visible">
                    </Modal>
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
    data:function(){
        return {
            previewImgSrc:null,
            visible:false
        };
    },
    mounted () {
        
    },
    methods:{
        handleView (previewImgSrc) {
            this.previewImgSrc = this.fileRealUrl(previewImgSrc);
            this.visible = true;
        }
    }
}
</script>
<style lang="scss" scoped>
    .demo-upload-list{
        display: inline-block;
        width: 120px;
        height: 120px;
        text-align: center;
        line-height: 120px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-right: 4px;
        img{
            width: 100%;
            height: 100%;
        }
    }
    .demo-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
        i{
            color: #fff;
            font-size: 32px;
            cursor: pointer;
            margin: 0 2px;
        }
        .ivu-icon-ios-trash-outline{
            font-size: 20px;
            color:red;
            position: absolute;
            right: 0px;
            top:0px;
        }
    }
    .demo-upload-list:hover .demo-upload-list-cover{
        display: block;
    }
    .preview-img{
        max-width:100%;
    }
</style>


