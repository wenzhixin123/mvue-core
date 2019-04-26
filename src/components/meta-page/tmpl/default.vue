<template>
  <meta-page :header="header" :page-settings="pageSettings"></meta-page>
</template>
<script>
  import context from '../../../libs/context';
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  export default {
    data:function(){
      let pageInfo=this.resolvePage();
      return pageInfo;
    },
    methods:{
      resolvePage(){
        let self=this;
        let key=this.$route.matched[this.$route.matched.length-1].path;
        let confs=context.appCtx.getAutoPageConfs();
        var pageSettings=metaLayoutConvertor.convert(_.cloneDeep(confs[key]),self);
        var header={
          title:pageSettings.title,
          description:pageSettings.description
        };
        return {
          pageSettings:pageSettings,
          header:header
        };
      }
    }
  };
</script>

