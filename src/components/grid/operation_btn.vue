<template>
<div class="operation-btn-con">
    <a v-for="(btn,index) in permedBtns()" :key="index" @click.stop.prevent="handleClick(btn)"
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
    },
    item:{
        type:Object,
        required:true
    }
  },
  methods: {
        handleClick (btn) {
            this.$emit('click', btn);
        },
        permedBtns(){
            var _this=this;
            let _btns= _.filter(this.btns, function(o) { 
                let has=Utils.hasDataPerm(_this.item,o); 
                return has;
            });
            return _btns;
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


