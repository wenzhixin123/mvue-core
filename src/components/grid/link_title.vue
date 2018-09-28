<template>
    <div @click = "handleClick">
        <a class="grid-title-cell" :title="titleVal"  v-html="titleVal"></a>
    </div>
</template>
<script>
    import controlTypeService from '../form/js/control_type_service';
export default {
    props:{
        params:{
            type:Object,
            required:true
        },
        item:{
            type:Object,
            required:true
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
        }
    }
}
</script>


