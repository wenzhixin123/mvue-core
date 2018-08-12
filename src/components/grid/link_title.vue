<template>
    <div @click = "handleClick">
        <a class="grid-title-cell" :title="params.titleField?item[params.titleField]:item.title"  v-html="params.titleField?item[params.titleField]:item.title"></a>
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
    methods:{
        handleClick(){
            this.$emit("click",this.item);
        }
    }
}
</script>


