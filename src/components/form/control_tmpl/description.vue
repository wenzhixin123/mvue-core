<template>
  <div class="description" :style="{'text-align':formItem.componentParams.align}" v-html="formItem.componentParams.content"></div>
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

</style>

