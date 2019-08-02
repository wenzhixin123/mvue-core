<template>
  <meta-page v-bind="bindProps"></meta-page>
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
        let matchedRoute=null;
        _.forEach(this.$route.matched,route=>{
          if(route.meta && route.meta.type=="js"){
            if(route.instances.default && !_.has(route.instances.default,"$loaded")){
              matchedRoute=route;
              route.instances.default["$loaded"]=true;
              return false;
            }
          }
        });
        if(matchedRoute==null){
          matchedRoute=this.$route.matched[this.$route.matched.length-1];
        }
        let key=matchedRoute.path;
        let confs=context.appCtx.getAutoPageConfs();
        var pageSettings=metaLayoutConvertor.convert(_.cloneDeep(confs[key]),self);
        return {
          bindProps:pageSettings
        };
      }

    }
  };
</script>

