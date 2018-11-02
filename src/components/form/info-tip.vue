<template>
  <div class="info-tip">
    <Poptip trigger="hover" title="提示" placement="right">
      <Icon type="ios-information-circle-outline" color="#2db7f5"/>
      <div slot="content" style="width: 400px;white-space: normal">
        <p>{{content}}</p>
      </div>
    </Poptip>
  </div>
</template>
<script>
  module.exports = {
    props: {
      content: {
        type: String
      }
    },
    data: function () {
      return {
      }
    }
  };
</script>

<style lang="sass" scoped>
  .info-tip
    text-align: left
    display: inline-block
    position: relative
    .info-icon
      font-size: 15px
      cursor: pointer
      color: grey
</style>
