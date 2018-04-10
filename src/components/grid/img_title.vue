<template>
    <div class="img-title-con">
        <span class="fl imgBox">
            <i>
                <img v-if="params.iconField && item[params.iconField]" :src="contextPath + item[params.iconField]" @error="nofind($event)" alt="">
                <em>{{params.titleField?item[params.titleField].slice(0,1):(item.title?item.title.slice(0,1):'')}}</em>
            </i>
        </span>
        <div class="detailBox" >
            <h5>
                <b>
                    <a class="colorgray" @click = "handleClick" v-html="params.titleField?item[params.titleField]:item.title"></a>
                </b>
            </h5>
            <p v-wordlimit="{length:params.wordlimit,text:params.descField?item[params.descField]:item.description}"></p>
        </div>
    </div>
</template>
<script>
var Config=require("../../config/config");
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
    data: function(){
        return {
            contextPath :Config.contextPath.url
        }
    },
    methods:{
        //图片出错处理
        nofind: function ($event) {
            $($event.target).hide();
        },
        handleClick(){
            this.$emit("click");
        }
    }
}
</script>
<style lang="less" scoped>
.img-title-con{
    margin-top:3px;
    margin-left:-15px;
    .imgBox{
        padding:10px 0px;
    }
    .detailBox{
        padding-top:10px;
    }
}
</style>


