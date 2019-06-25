<template>
    <img @click="handleClick" v-if="preprocessed" :src="src" :style="{width:width,height:height}">
</template>
<script>
import ufs from "../../../../libs/ufs";
import files from "./files";
export default {
    props:{
        item:{
            type:Object,
            required:true
        },
        width:{
            type:String
        },
        height:{
            type:String
        },
        paths:{
            type:Object,
            default(){
                return {};
            }
        }
    },
    watch:{
        item:{
            handler(newV,oldV){
                if(!this.item){
                    return;
                }
                //没有id和url时，不获取图片
                if(_.isNil(newV.id)&&_.isNil(newV.url)){
                    return;
                }
                //只检测url和id的变化才重设地址
                if(newV&&oldV){
                    if(newV.url&&newV.url===oldV.url){
                        return;
                    }
                    if(newV.id&&newV.id===oldV.id){
                        return;
                    }
                }
                files.fileRealUrl(this.item,this.paths.uploadUrl).then(url=>{
                    this.src=url;
                    this.preprocessed=true;
                });
            },
            deep:true,
            immediate:true
        }
    },
    data(){
        return {
            preprocessed:false,
            src:''
        };
    },
    methods:{
        handleClick(){
            this.$emit('click');
        }
    }
}
</script>

