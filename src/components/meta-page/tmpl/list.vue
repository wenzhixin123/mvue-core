<template>
    <meta-page
        v-bind="bindProps"
        :id="'default-grid-uuid-'+metaEntity.name">
    </meta-page>
</template>
<script>
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  export default {
    data:function(){
      var entityName=this.$route.params.entityName;
      var metaEntity=this.$metaBase.findMetaEntity(entityName);
      var errorObj={has:false,code:null,message:null};
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
            message:`实体${metaEntity.title}列表，已被禁止访问，请通过配置启用该页面后，再重试！`
          });
        }
      }
      return {
        metaEntity:metaEntity,
        bindProps:{//需要绑定的所有属性
          lazy:true,
          preprocessed:false,
          showCard:true,
          showHeader:true,
          header:{
            title:`${metaEntity.title || metaEntity.name}列表`,
            description:metaEntity.description,
            showBack:false
          },
          errorObj:errorObj,
          pageSettings:{layout:[]}
        }
      }
    },
    mounted:function () {
      if(this.bindProps.errorObj.has){
        return;
      }
      this.metaEntity.getPage("list").then((st)=>{
        if(st==null){
          this.bindProps.errorObj.has=true;
          this.bindProps.errorObj.message=`[${this.metaEntity.title}]列表，已被禁止访问，请通过配置启用该页面后，再重试！`;
          return;
        }
        if(st.title){
          this.bindProps.header.title=st.title;
          delete st.title;
        }
        let pageSettings = metaLayoutConvertor.convert(st, this);
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
  };
</script>
