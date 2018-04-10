<template>
  <div class="division-line">
      <div class="title" :style="{'text-align':formItem.componentParams.titleAlign}" v-html="formItem.componentParams.title"></div>
      <hr>
      <div class="description" :style="{'text-align':formItem.componentParams.descriptionAlign}" v-html="formItem.componentParams.description"></div>
  </div>
</template>
<script>
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        }
    }
}
</script>
<style lang="scss" scoped="true">
.division-line{
    .title{
        font-weight: bold;
    }
    hr{
        margin-top:10px;
        margin-bottom:5px;
    }
}
</style>