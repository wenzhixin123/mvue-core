<template>
    <div class="grid-col-pictures">
        <div v-for="f in item[params.metaField.name]" :key="f.url" :src="fileRealUrl(f.url)" @click="handlePreview(f)"><a><i class="ivu-icon ivu-icon-document"></i> {{f.name}}</a></div>
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
    methods:{
        fileRealUrl:function(url){
            return `${this.params.uploadUrl}?filePath=${url}`;
        },
        handlePreview(file){
            let previewUrl = this.fileRealUrl(file.url);
            window.open(previewUrl,"_blank");
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
}
</style>

