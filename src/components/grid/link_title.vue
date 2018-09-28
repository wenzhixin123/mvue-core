<template>
    <meta-operation  :operation="btn" :widget-context="getWidgetContext()">
        <a class="grid-title-cell" :title="titleVal"  v-html="titleVal"></a>
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
        }
    },
    computed:{
      titleVal:function () {
          var val = controlTypeService.formatData(this.item, this.params);
          //var val=this.item[this.params.name];
          return val;
      }
    },
    methods:{
        handleClick(){
            this.$emit("click",this.item);
        },
        getWidgetContext(){
            return {
                grid:this.context&&this.context.grid,
                selectedId:this.item.id,
                selectedItem:this.item,
                metaEntity:this.context&&this.context.grid&&this.context.grid.metaEntity
            }
        }
    }
}
</script>


