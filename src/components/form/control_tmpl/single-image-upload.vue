<template>
    <div>
        <template v-if="viewMode">
            <div v-if="isNotEmpty(defaultList)">
                <div class="demo-upload-list" v-for="item in defaultList" :key="item.url">
                    <div>
                        <img :style="{width:uploadIconWidth,height:uploadIconHeight}" :src="fileRealUrl(item.url)">
                        <div class="demo-upload-list-cover">
                            <Icon type="ios-eye-outline" @click="handleView(item.url)"></Icon> 
                        </div>
                    </div>
                </div>
                <Modal title="查看图片" v-model="visible">
                    <img class="preview-img" :src="previewImgSrc" v-if="visible">
                </Modal>
            </div>
        </template>
        <template v-else>
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
                    type="drag"
                    name="image"
                    :action="uploadAction"
                    :class="{'has-file':hasFile(),'potrait-upload':true}"
                    style="display: inline-block;">
                    <div v-if="hasFile()" style="line-height:normal;">
                        <div class="demo-upload-list" v-for="item in fileList()" :key="item.url">
                            <div v-if="item.status === 'finished'">
                                <img :style="{width:uploadIconWidth,height:uploadIconHeight}" :src="fileRealUrl(item.url)">
                                <div class="demo-upload-list-cover">
                                    <Icon type="ios-eye-outline" @click.stop="handleView(item.url)" title="预览"></Icon> 
                                    <Icon type="ios-trash-outline" @click.stop="handleRemove(item)" title="删除"></Icon>
                                </div>
                            </div>
                            <div v-else>
                                <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                            </div>
                        </div>
                    </div>
                    <div v-else :style="{width:uploadIconWidth,height:uploadIconHeight,'padding-top':uploadIconPaddingTop}">
                        <Icon type="ios-image-outline" :size="uploadIconSize" color="#becbd9"/>
                    </div>
                </Upload>
                <Modal title="查看图片" v-model="visible">
                    <img class="preview-img" :src="previewImgSrc" v-if="visible">
                </Modal>
            </div>
        </template>
    </div>
</template>
<script>
import controlBase from '../js/control_base';
import uploadBase from '../js/upload_base';
import singleUpload from '../js/single-upload';
export default {
    mixins: [controlBase,singleUpload,uploadBase],
    data:function(){
        return {
            previewImgSrc:null,
            visible:false
        };
    },
    computed:{
        uploadIconWidth(){
            var w=(this.formItem.componentParams&&this.formItem.componentParams.width)||130;
            return `${w}px`;
        },
        uploadIconHeight(){
            var h=(this.formItem.componentParams&&this.formItem.componentParams.height)||150;
            return `${h}px`;
        },
        uploadIconPaddingTop(){
            var w=(this.formItem.componentParams&&this.formItem.componentParams.width)||130;
            var h=(this.formItem.componentParams&&this.formItem.componentParams.height)||150;
            var s=w<h?(h-w*3/4)/2:h/8;
            return `${s}px`;
        },
        uploadIconSize(){
            var w=(this.formItem.componentParams&&this.formItem.componentParams.width)||130;
            var h=(this.formItem.componentParams&&this.formItem.componentParams.height)||150;
            var s=w<h?w:h;
            return s*3/4;
        }
    },
    methods:{
        hasFile(){
            return this.fileList()&&this.fileList().length>0;
        },
        handleView (previewImgSrc) {
            this.previewImgSrc = this.fileRealUrl(previewImgSrc);
            this.visible = true;
        }
    }
}
</script>
<style lang="less">
.potrait-upload.has-file .ivu-upload-drag{
    border:none;
}
</style>

<style lang="less" scoped>
    .demo-upload-list{
        display: inline-block;
        text-align: center;
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
        .ivu-icon-ios-eye-outline{
            position: absolute;
            left: 0px;
            top:0px;
        }
        .ivu-icon-ios-trash-outline{
            font-size: 28px;
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


