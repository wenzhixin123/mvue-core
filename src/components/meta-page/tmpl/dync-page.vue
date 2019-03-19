<template>
    <meta-page
      :lazy="true"
      :preprocessed="ready"
      :header="header"
      :error-obj="errorObj"
      :page-settings="pageSettings">
    </meta-page>
</template>
<script>
  import pathToRegexp from 'path-to-regexp';
  import metaLayoutConvertor from '../../meta-layout/layout-convertor';
  import context from '../../../libs/context';
  import metaService from '../../../services/meta/metaservice';
  export default {
    data:function(){
      return {
        pageSettings:null,
        header:{
          header:null,
          description:null
        },
        errorObj:{
          has:false,code:null,message:null
        },
        ready:false
      };
    },
    async mounted() {
      let self = this;
      let path = this.matchedRoutePath();
      path = path.substr(path.indexOf("/", 2)+1);
      try{
        let page = await metaService().getPage(path);
        this.pageSettings = metaLayoutConvertor.convert(_.cloneDeep(page), this);
        if(this.pageSettings.title){
          this.header = {
            title: this.pageSettings.title,
            description: this.pageSettings.description
          }
        }
        this.ready=true;
      }catch (e) {
        console.error(e);
        this.errorObj.has=true;
        this.errorObj.message="页面错误";
      }
    },
    methods:{
      matchedRoutePath() {
        let matchedRoute = context.componentInRoute(this);
        if (!matchedRoute) {
          matchedRoute = this.$route;
        }
        let url = pathToRegexp.compile(matchedRoute.path)(this.$route.params);
        return url;
      }
    }
  };
</script>

