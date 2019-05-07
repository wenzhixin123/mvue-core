<template>
    <meta-page
        :header="header"
        :hide-header="!isGrid()"
        :hide-card="!isGrid()"
        :error-obj="errorObj"
        :lazy="true"
        :preprocessed="isReady"
        :page-settings="{layout:layout}"
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
        isReady:false,
        errorObj:errorObj,
        header:{
          title:`${metaEntity.title || metaEntity.name}列表`,
          description:metaEntity.description,
          showBack:false
        },
        metaEntity:metaEntity,
        grid:{
          entityName:metaEntity.name
        },
        layout:[]
      }
    },
    mounted:function () {
      if(this.errorObj.has){
        return;
      }
      this.metaEntity.getPage("list").then((st)=>{
        if(st==null){
          this.errorObj.has=true;
          this.errorObj.message=`[${this.metaEntity.title}]列表，已被禁止访问，请通过配置启用该页面后，再重试！`;
          return;
        }
        this.grid=this.metaEntity.extendUISettings(this.grid,st);
        if(this.grid && this.grid.title){
          this.header.title=this.grid.title;
        }
        this.layout=this.buildLayout();
        this.isReady=true;
      });
    },
    methods:{
        buildLayout(){
            var self=this;
            var pageSettings = metaLayoutConvertor.convert(this.grid, self);
            var layout=pageSettings.layout;
            return layout;
        },
        isGrid(){
            return this.grid.ctype=="m-grid" || this.grid.ctype=="m-tree-grid";
        }
    }
  };
</script>
