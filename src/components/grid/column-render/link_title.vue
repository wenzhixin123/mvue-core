<template>
    <meta-operation  :operation="btn" :widget-context="getWidgetContext()" class="link-title-opt">
        <Tooltip v-if="initialCol&&initialCol.tooltip" transfer :content="titleVal" :disabled="!showTooltip" :max-width="300" class="ivu-table-cell-tooltip">
            <a ref="content" @mouseenter="handleTooltipIn" @mouseleave="handleTooltipOut" class="ivu-table-cell-tooltip-content">{{ titleVal }}</a>
        </Tooltip>
        <a v-else style="display:block;" :class="{'ivu-table-cell-ellipsis':true}" :title="titleVal"  v-html="titleVal"></a>
        <template slot="onDeny">
            <span style="display:block;" :class="{'ivu-table-cell-ellipsis':true}" :title="titleVal"  v-html="titleVal"></span>
        </template>
    </meta-operation>
</template>
<script>
import controlTypeService from '../../form/js/control_type_service';
export default {
    props:{
        params:{
            type:Object,
            required:true
        },
        btn:{
            type:Object,
            required:true
        },
        item:{
            type:Object,
            required:true
        },
        context:{
            type:Object
        },
        initialCol:{
            type:Object
        }
    },
    computed:{
      titleVal:function () {
          var val = controlTypeService.formatData(this.item, this.params);
          return val;
      }
    },
    data(){
        return {
            showTooltip:false
        };
    },
    methods:{
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
                metaEntity:this.context&&this.context.grid&&this.context.grid.metaEntity
            }
        },
        handleTooltipIn () {
            const $content = this.$refs.content;
            this.showTooltip = $content.scrollWidth > $content.offsetWidth;
        },
        handleTooltipOut () {
            this.showTooltip = false;
        }
    }
}
</script>
<style lang="less">
.ivu-table-cell .link-title-opt.div-inline-block{
    display: block;
}
</style>



