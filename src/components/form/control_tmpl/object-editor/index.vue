<template>
  <Form @submit.native.prevent ref="formRef" class="m-embedded-json"
    :model="entity"
    :force-view="forceView"
    :rules="innerRules" 
    :inline="formItem.componentParams.inline||false" 
    :label-position="formItem.componentParams.labelPosition||'right'" 
    :label-width="formItem.componentParams.labelWidth||itemLabelWidth"
    :show-message="formItem.componentParams.showMessage||true" 
    :autocomplete="formItem.componentParams.autocomplete||'off'">
    <m-layout :layout="layout" :itemProcessor="layoutProcessor"></m-layout>
  </Form>
</template>
<script>
import controlBase from '../../js/control_base';
import formLayout from '../../mixins/form-layout';
export default {
  mixins: [controlBase,formLayout],
  props:{
    value:{
      type:Object
    }
  },
  data(){
    let entityName=this.formItem.componentParams.entityName;
    let metaEntity=this.$metaBase.findMetaEntity(entityName);
    let layout=this.formItem.componentParams.layout||[];
    if(_.isEmpty(layout)){
      _.forEach(metaEntity.getDefaultFormFields(),(metaFieldName)=>{
        layout.push({
          ctype:"m-field",
          name:metaFieldName,
          context:this.fieldContext(metaEntity)
        });
      });
    }
    let entity=metaEntity.getDefaultModel();
    let innerRules=this.initValidateRulesByMetaEntity(metaEntity,entity);
    return {
      isMetaForm:true,
      entityName:entityName,
      metaEntity:metaEntity,
      entity:entity,
      layout:layout,
      innerRules:innerRules,
      forceView:false
    };
  },
  watch:{
    "value":{
      handler:function (newV,oldV) {
        if(!_.isEqual(this.value,this.entity)){
          if(_.isNil(this.value)){
            return;
          }
          _.forIn(this.value,(value,key)=>{
            this.entity[key]=value;
          });
        }
      },
      deep:true,
      immediate:true
    },
    "entity":{
      handler:function(newV,oldV){
        if(!_.isEqual(this.value,this.entity)){
          let _v=_.cloneDeep(this.entity);
          this.$emit('input',_v);
          this.dispatch&&this.dispatch('FormItem', 'on-form-change',_v);
        }
      },
      deep:true
    }
  },
  methods:{
    validate(rule, value, callback){
      if(!value){
        callback();
        return;
      }
      if(this.$refs.formRef){
        this.$refs.formRef.validate(valid => {
          if (valid) {
            callback();
          }else{
            callback(new Error(' '));
          }
        });
      }else{
        callback();
      }
    }
  }
}
</script>
