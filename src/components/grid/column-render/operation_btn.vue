<template>
<div class="operation-btn-con">
    <meta-operation v-for="(btn,index) in permedBtns()" v-show="showBtn(btn)" :key="index" :operation="btn" :widget-context="getWidgetContext()">
        <a href="javascript:void(0)" class="btn" :title="btn.title" >
            <m-icon :type="btn.icon"></m-icon>
        </a>
    </meta-operation>
</div>
</template>
<script>
import globalContext from '../../../libs/context';
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
        showBtn(btn){
            if(btn.toggle===false){
                return false;
            }else if(_.isFunction(btn.toggle)){
                return btn.toggle(this.context,this.item);
            }
            return true;
        },
        handleClick (btn) {
            this.$emit('click', btn);
        },
        permedBtns(){
            var _this=this;
            let _btns= _.filter(this.btns, function(o) { 
                let has=globalContext.getMvueToolkit().utils.hasDataPerm(_this.item,o); 
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
<style lang="less">
.operation-btn-con{
    display:inline-block;
    .btn>.ivu-icon{
        font-size:16px;
        padding: 0px 8px;
    }
}
</style>


