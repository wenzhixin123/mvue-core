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
            handler(){
                if(!this.item){
                    return;
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

