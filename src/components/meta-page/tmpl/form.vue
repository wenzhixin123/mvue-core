<template>
  <meta-page
    v-bind="bindProps"
    :id="'default-form-uuid-'+metaEntity.name">
  </meta-page>
</template>
<script>
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  export default {
    data:function () {
      var entityName=this.$route.params.entityName;
      var id=this.$route.params.id;
      var errorObj={has:false,code:null,message:null};
      var metaEntity=this.$metaBase.findMetaEntity(entityName);
      if(metaEntity==null){
        errorObj=_.assign(errorObj,{
          has:true,
          code:"404",
          message:`实体${entityName}不存在`
        });
        metaEntity={title:"不存在实体"};
      }else{
        var hasError=!metaEntity.isUIEnable();
        if(hasError){
          errorObj=_.assign(errorObj,{
            has:true,
            code:"500",
            message:`[${metaEntity.title}]表单，已被禁止访问，请通过配置启用该页面后，再重试！`
          });
        }
      }
      return {
        recordId:id,
        metaEntity:metaEntity,
        bindProps:{//需要绑定的所有属性
          lazy:true,
          preprocessed:false,
          showCard:true,
          showHeader:true,
          header:{
            title:''
          },
          errorObj:errorObj,
          pageSettings:{layout:[]}
        }
      }
    },
    mounted(){
      var action=this.$route.params.action;
      if(this.bindProps.errorObj.has){
        return;
      }
      this.metaEntity.getPage(action).then(st=>{
        if(st==null){
          this.bindProps.errorObj.has=true;
          this.bindProps.errorObj.message=`[${this.metaEntity.title}]编辑表单，已被禁止访问，请通过配置启用该页面后，再重试！`;
          return;
        }
        if(this.form && this.form.title){
          this.bindProps.header.title=this.form.title;
          delete st.title;
        }
        var pageSettings = metaLayoutConvertor.convert(st, this);
        var layout=pageSettings.layout;
        _.forEach(layout,com=>{
          if(com.ctype=="m-form" || com.ctype=="m-detail-view"){
            com["entityName"]=this.metaEntity.name;
            com["recordId"]=this.recordId;
          }
          if(com.ctype=="m-detail-view"){
            this.bindProps.showHeader=false;
          }
        });
        if(st.ctype=="m-page" && pageSettings.layout){
          this.bindProps.pageSettings.layout=_.cloneDeep(pageSettings.layout);
          delete pageSettings.layout;
          _.assign(this.bindProps,pageSettings);
        }else{
          this.bindProps.pageSettings=pageSettings;
        }
        this.bindProps.preprocessed=true;
      });
    }
  }
</script>
