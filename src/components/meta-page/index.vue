<template>
  <div class="bvue-page" v-if="!noPage">
    <b-childheader v-if="showHeader" :title="innerTitle" :subtitle="header.description" :show-back="header.showBack" :back-route="header.backRoute"></b-childheader>
    <div class="bvue-page-body" v-if="renderLayout">
        <meta-layout v-if="!showCard" :layout="pageSettings.layout"></meta-layout>
        <Card v-else>
            <meta-layout :layout="pageSettings.layout"></meta-layout>
        </Card>
    </div>
    <div v-if="errorObj&&errorObj.has" class="bvue-page-body" >
      <Card>
        <Alert type="warning"  show-icon style="margin: 20px 200px">
          页面错误
          <template slot="desc">
            {{ errorObj.message}}
          </template>
        </Alert>
      </Card>
    </div>
  </div>
  <div v-else>
    <meta-layout v-if="renderLayout" :layout="pageSettings.layout"></meta-layout>
    <Alert type="warning" v-if="errorObj.has" show-icon style="margin: 20px 200px">
      页面错误
      <template slot="desc">
        {{ errorObj.message }}
      </template>
    </Alert>
  </div>
</template>
<script>
  import  pageHelper from "./page-helper";
export default {
  props: {
    header: {
      type: Object,
      default() {
        return {};
      }
    },
    pageSettings: {
      type: Object,
      default() {
        return {layout: []};
      }
    },
    layout: {
      type: Array,
      default() {
        return null;
      }
    },
    errorObj: {
      type: Object,
      default() {
        return {
          has: false
        }
      }
    },
    showCard: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    lazy: {//是否开启延迟加载，开启后通过preprocessed控制布局渲染
      type: Boolean,
      default: false
    },
    preprocessed: {
      type: Boolean,
      default: false
    },
    noPage: {//是否在bvue-page布局下
      type: Boolean,
      default: false
    },
    title: {
      type: [String,Object]
    }
  },
  computed: {
    innerTitle() {
      return this.$store.state.core.pageTitle;
    },
    renderLayout() {//是否开始渲染布局
      let canRender=false;
      if (!this.lazy) {//非延迟渲染模式，即时渲染
        canRender = true;
      } else {//延迟渲染模式，预处理完毕后渲染
        canRender = this.lazy && this.preprocessed;
      }
      //pageSettings完整后才做一下预备设置
      if(canRender){
        this.prepare();
      }
      return canRender;
    }
  },
  watch:{
    header:{
      handler(){
        var sourceId = this.title && this.title.source;
        //如果定义了title是来源于某个组件，则注册这个组件id到全局
        //如果sourceId为空，也要清除
        this.$store.commit('core/setPageTitleSourceId', sourceId)
        let _title=this.header && this.header.title;
        if(!_title){
          _title=this.title;
        }
        if (_title && _.isString(_title)) {//如果自定义了title，强制设置进去
          this.$store.commit('core/setPageTitleCoercively', _title);
        }
      },
      immediate:true
    }
  },
  created() {
    if (this.noPage) {
      return;
    }
  },
  data: function () {
    let self=this;
    if (this.layout != null && this.layout.length > 0) {
      this.pageSettings.layout = this.layout;
    }
    //定义page的运行Context
    let pageContext=pageHelper.buildPageContext(self);
    return {
      isPage: true,
      pageContext:pageContext
    };
  },
  mounted(){
    
  },
  methods: {
    prepare(){
      //解析组件相关的事件和相关动态属性
      pageHelper.preparePageSettings(this.pageSettings,this.pageContext);
      //页面初始化事件调用
      let pageSettings = pageHelper.getComConfig(this.pageSettings,"$page");
      if(pageSettings){
        let initEvent=pageSettings.events["on-inited"];
        if(initEvent){
          initEvent.apply(this);
        }
      }
    },
    getPageContext() {
      return this.pageContext;
    },
    registerComponent(id,com){
      this.pageContext.vNodes[id]=com;
      Object.defineProperty(this.pageContext,id, {
        get: function () {
          return com.componentInstance;
        },
        configurable:true,
        enumerable: true
      });
    },
    getPageSettings(){
      return this.pageSettings;
    }
  }
};
</script>

