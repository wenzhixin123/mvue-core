<template>
  <meta-page
    :header="header"
    :hide-header="!isForm()"
    :hide-card="!isForm()"
    :error-obj="errorObj"
    :lazy="true"
    :preprocessed="isReady"
    :page-settings="{layout:layout}"
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
        isReady:false,
        errorObj:errorObj,
        header:{
          title:"",
        },
        recordId:id,
        metaEntity:metaEntity,
        form:{
          entityName:metaEntity.name,
          recordId:id,
        },
        layout:[]
      }
    },
    mounted(){
      var action=this.$route.params.action;
      if(this.errorObj.has){
        return;
      }
      this.metaEntity.getPage(action).then(st=>{
        if(st==null){
          this.errorObj.has=true;
          this.errorObj.message=`[${this.metaEntity.title}]编辑表单，已被禁止访问，请通过配置启用该页面后，再重试！`;
          return;
        }
        this.form=this.metaEntity.extendUISettings(this.form,st || {});
        if(this.form && this.form.title){
          this.header.title=this.form.title;
        }
        this.layout=this.buildLayout();
        this.isReady=true;
      });
    },
    methods:{
      buildLayout(){
        var self=this;
        var pageSettings = metaLayoutConvertor.convert(this.form, self);
        var layout=pageSettings.layout;
        _.forEach(layout,com=>{
          if(com.ctype=="m-form" || com.ctype=="m-detail-view"){
            com["entityName"]=this.metaEntity.name;
            com["recordId"]=this.recordId;
          }
        });
        return layout;
      },
      isForm(){
        let matched= this.form.ctype=="m-form";
        if(!matched && this.form.layout){
          _.forEach(this.form.layout,(c,index)=>{
            if(c.ctype=="m-form"){
              matched=true;
              return false;
            }
          });
        }
        return matched;
      }
    }
  }
</script>
