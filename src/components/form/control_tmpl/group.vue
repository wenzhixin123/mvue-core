<template>
  <div class="form-group-con">
      <div class="title-con">
          <i @click.stop.prevent="showPanel=!showPanel" class="ivu-icon" :class="{'ivu-icon-chevron-down':showPanel,'ivu-icon-chevron-left':!showPanel}"></i>
          <span class="title" v-html="formItem.componentParams.title"></span>
      </div>
      <div class="description" v-html="formItem.componentParams.description"></div>
      <div class="form-group-children-con" v-show="showPanel">
        <slot></slot>
      </div>
  </div>
</template>
<script>
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        }
    },
    data:function(){
        return {
            showPanel:true
        }
    }
}
</script>
<style lang="scss" scoped="true">
.form-group-con{
    border:1px solid #eee;
    margin-bottom:5px;
    .title-con{
        background-color: #eee;
        padding: 5px;
        .ivu-icon{
            width:14px;
        }
        .title{
            font-weight: bold;
        }
    }
    .description{
        font-size:12px;
        padding: 5px;
    }
    .form-group-children-con{
        padding:0px 5px;
    }
}
</style>