<template>
    <meta-operation  :operation="btn" :widget-context="getWidgetContext()">
        <Tooltip v-if="initialCol&&initialCol.tooltip" transfer :content="titleVal" :disabled="!showTooltip" :max-width="300" class="ivu-table-cell-tooltip">
            <a ref="content" @mouseenter="handleTooltipIn" @mouseleave="handleTooltipOut" class="ivu-table-cell-tooltip-content">{{ titleVal }}</a>
        </Tooltip>
        <a v-else style="display:block;" :class="{'ivu-table-cell-ellipsis':initialCol&&initialCol.ellipsis}" :title="titleVal"  v-html="titleVal"></a>
    </meta-operation>
</template>
<script>
import controlTypeService from '../form/js/control_type_service';
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
            return {
                grid:this.context&&this.context.grid,
                selectedId:this.item.id,
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
<style lang="scss">
.ivu-table-cell-ellipsis .widget-operation.div-inline-block{
    display: block;
}
</style>



