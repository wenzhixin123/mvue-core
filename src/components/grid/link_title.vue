<template>
    <div @click = "handleClick">
        <a class="grid-title-cell" :title="titleVal"  v-html="titleVal"></a>
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
    computed:{
      titleVal:function () {
          var val=this.item[this.params.name];
          return val;
      }
    },
    methods:{
        handleClick(){
            this.$emit("click",this.item);
        }
    }
}
</script>


