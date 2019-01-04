<template>
    <div class="grid-col-pictures">
        <ufs-image v-for="f in files()" :key="f.id||f.url" @click="handleView(f)" :item='f' :paths='params'></ufs-image>
        <Modal title="查看图片" v-model="visible">
            <div style="overflow:auto;">
                <ufs-image class="preview-img" v-if="visible" :item='previewItem' :paths='params'></ufs-image>
            </div>
        </Modal>
    </div>
</template>
<script>
export default {
    components:{
        ufsImage:require('../form/control_tmpl/upload/ufs-image')
    },
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
            previewItem:null
        };
    },
    methods:{
        files(){
            var files=this.item[this.params.metaField.name];
            if(_.isPlainObject(files)){
                return [files];
            }
            return files;
        },
        handleView (item) {
            this.previewItem = item;
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
        margin-top: 10px;
    }
    img:hover{
        cursor: pointer;
    }
    .preview-img{
        max-width:100%;
    }
}
</style>

