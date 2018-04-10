<template>
    <div class="grid-col-pictures">
        <img v-for="f in item[params.metaField.name]" :key="f.url" :src="fileRealUrl(f.url)" @click="handleView(f.url)">
        <Modal title="查看图片" v-model="visible">
            <img class="preview-img" :src="previewImgSrc" v-if="visible">
        </Modal>
    </div>
</template>
<script>
export default {
    props:{
        params:{
            type:Object,
            required:true
        },
        item:{
            type:Object,
            required:true
        }
    },
    data:function(){
        return {
            visible:false,
            previewImgSrc:null
        };
    },
    methods:{
        fileRealUrl:function(url){
            return `${this.params.uploadUrl}?filePath=${url}`;
        },
        handleView (previewImgSrc) {
            this.previewImgSrc = this.fileRealUrl(previewImgSrc);
            this.visible = true;
        }
    }
}
</script>
<style lang="less" scoped>
.grid-col-pictures{
    padding:5px;
    img{
        width:32px;
        height:32px;
        margin-right:5px;
        margin-bottom:5px;
    }
    img:hover{
        cursor: pointer;
    }
    .preview-img{
        max-width:100%;
    }
}
</style>

