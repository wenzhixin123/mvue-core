<template>
  <meta-page 
    :error-obj="errorObj" 
    :lazy="true"
    :preprocessed="ready"
    :no-page="true"
    :page-settings="pageSettings"></meta-page>
</template>
<script>
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  export default {
    data:function(){
      var errorObj={has:false,code:null,message:null};
      return {
        errorObj:errorObj,
        ready:false,
        pageSettings:null,
      };
    },
     mounted:async function() {
      var self=this;
      var entityName=this.$route.params.entityName;
      var subPage=this.$route.params.subPage;
      var recordId=this.$route.params.id;
      var metaEntity=this.$metaBase.findMetaEntity(entityName);
      if(metaEntity==null){
        this.errorObj.has=true;
        this.errorObj.message=`实体${entityName}不存在`;
        return;
      }
       try{
          var settings=null;
          if(metaEntity){
            settings=await metaEntity.getPage(subPage);
          }
          if(_.isEmpty(settings)){
            this.$router.push({path:this.$route.path+"/list",query:this.$route.query});
            return;
            //settings=await metaEntity.getRelationPage(subPage,"list");
          }
          this.pageSettings=metaLayoutConvertor.convert(settings,self);
          _.forEach(this.pageSettings.layout,com=>{
            if(com.ctype=="m-form" || com.ctype=="m-detail-view"){
              com["entityName"]=metaEntity.name;
              com["recordId"]=recordId;
            }
          });
          this.ready=true;
        }catch (e){
          console.error(e);
          this.errorObj.has=true;
          this.errorObj.message=e;
        }
    }
  };
</script>

