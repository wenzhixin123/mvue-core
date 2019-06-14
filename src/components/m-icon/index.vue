<template>
  <Icon 
    :type="innerType"
    :size="size"
    :color="color"
    :custom="innerCustom">
  </Icon>
</template>
<script>
export default {
  props: {
      type: {
          type: String,
          default: ''
      },
      size: [Number, String],
      color: String,
      custom: {
          type: String,
          default: ''
      }
  },
  data(){
    let innerType=this.type;
    let innerCustom=this.custom;
    if(this.typeIsCustom()){
      innerCustom=this.type.substring(1);
      innerType='';
    }
    return {
      innerType:innerType,
      innerCustom:innerCustom
    };
  },
  methods:{
    typeIsCustom(){
      return _.startsWith(this.type,'@');
    }
  }
}
</script>

