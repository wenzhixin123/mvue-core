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
        //如果当前路由的父路由也是使用这个default的page组件，父路由进入时应该找到父路由的组件配置：
        //  对于直接在浏览器刷新m-detail-view的一个tab地址时，无论是进入父路由还是子路由matched的最后匹配
        //  地址都是最终的tab地址，这样是不对的
        _.forEach(this.$route.matched,route=>{
          if(route.meta && route.meta.type==="js"){
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

