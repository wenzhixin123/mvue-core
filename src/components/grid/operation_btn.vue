<template>
<div class="operation-btn-con">
    <!-- <a v-for="(btn,index) in permedBtns()" :key="index" @click.stop.prevent="handleClick(btn)"
    href="javascript:void(0)" class="btn" :title="btn.title" >
      <Icon :type="btn.icon"></Icon>
    </a> -->
    <meta-operation v-for="(btn,index) in permedBtns()" :key="index" :operation="btn" :widget-context="getWidgetContext()">
        <a href="javascript:void(0)" class="btn" :title="btn.title" >
            <Icon :type="btn.icon"></Icon>
        </a>
    </meta-operation>
</div>
</template>
<script>
import context from '../../libs/context';
export default {
  props:{
    btns:{
        type:Array
    },
    item:{
        type:Object,
        required:true
    },
    context:{
        type:Object
    }
  },
  methods: {
        handleClick (btn) {
            this.$emit('click', btn);
        },
        permedBtns(){
            var _this=this;
            let _btns= _.filter(this.btns, function(o) { 
                let has=context.getMvueToolkit().utils.hasDataPerm(_this.item,o); 
                return has;
            });
            return _btns;
        },
        getWidgetContext(){
            var metaEntity=this.context&&this.context.grid&&this.context.grid.metaEntity;
            var idFieldName="id";
            if(metaEntity){
                idFieldName=metaEntity.getIdField().name;
            }
            return {
                grid:this.context&&this.context.grid,
                selectedId:this.item[idFieldName],
                selectedItem:this.item,
                metaEntity:metaEntity
            }
        }
    }
}
</script>
<style lang="less" scoped>
.operation-btn-con{
    display:inline-block;
    .btn>.ivu-icon{
        font-size:16px;
        padding: 0px 8px;
    }
}
</style>


