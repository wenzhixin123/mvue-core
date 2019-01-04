<template>
    <div class="grid-col-pictures">
        <div v-for="f in files()" :key="f.id||f.url"  @click="handlePreview(f)"><a><i class="ivu-icon ivu-icon-document"></i> {{f.name}}</a></div>
    </div>
</template>
<script>
import fileUtils from '../form/control_tmpl/upload/files';
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
        files(){
            var files=this.item[this.params.metaField.name];
            if(_.isPlainObject(files)){
                return [files];
            }
            return files;
        },
        handlePreview(file){
            fileUtils.download(file,this.params.uploadUrl);
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

