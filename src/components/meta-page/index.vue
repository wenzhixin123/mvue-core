<template>
  <div class="bvue-page">
    <b-childheader v-if="innerTitle" :title="innerTitle" :subtitle="header.description" :showBack="header.showBack" ></b-childheader>
    <div class="bvue-page-body">
      <Card>
        <meta-layout :layout="pageSettings.layout"></meta-layout>
      </Card>
    </div>
  </div>
</template>
<script>
export default {
    props:{
        header:{
            type:Object,
            default(){
                return {};
            }
        },
        pageSettings:{
            type:Object,
            required:true
        }
    },
    computed:{
        innerTitle(){
            return this.$store.state.core.pageTitle;
        }
    },
    created(){
        //每次进到页面都重置页面标题
        this.$store.commit('core/setPageTitleCoercively','');
        var sourceId=this.title&&this.title.source;
        //如果定义了title是来源于某个组件，则注册这个组件id到全局
        //如果sourceId为空，也要清除
        this.$store.commit('core/setPageTitleSourceId',sourceId)
        if(this.title&&_.isString(this.title)){//如果自定义了title，强制设置进去
            this.$store.commit('core/setPageTitleCoercively',this.title);
        }
    },
    data:function(){
        return {
            title:this.header&&this.header.title
        };
    }
};
</script>

