<template>
<div class="operation-btn-con">
    <a v-for="(btn,index) in btns" :key="index" @click="handleClick(btn)"
    href="javascript:void(0)" class="btn" :title="btn.title" >
      <Icon :type="btn.icon"></Icon>
    </a>
</div>
</template>
<script>
export default {
  props:{
      btns:{
          type:Array
      }
  },
  methods: {
        handleClick (btn) {
            this.$emit('click', btn);
        }
    }
}
</script>
<style lang="less" scoped>
.operation-btn-con{
    display:inline-block;
    .btn>.ivu-icon{
        font-size:16px;
    }
}
</style>


