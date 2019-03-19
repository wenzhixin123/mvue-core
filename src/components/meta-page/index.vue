<template>
  <div class="bvue-page" v-if="!noPage">
    <b-childheader v-if="innerTitle && !hideHeader" :title="innerTitle" :subtitle="header.description" :showBack="header.showBack" ></b-childheader>
    <div class="bvue-page-body" v-if="renderLayout">
        <meta-layout v-if="hideCard" :layout="pageSettings.layout"></meta-layout>
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
            default(){
                return {layout:[]};
            }
        },
        errorObj:{
            type:Object,
            default(){
                return {
                    has:false
                }
            }
        },
        hideCard:{
            type:Boolean,
            default:false
        },
        hideHeader:{
            type:Boolean,
            default:false
        },
        lazy:{//是否开启延迟加载，开启后通过preprocessed控制布局渲染
            type:Boolean,
            default:false
        },
        preprocessed:{
            type:Boolean,
            default:false
        },
        noPage:{//是否在bvue-page布局下
            type:Boolean,
            default:false
        }
    },
    computed:{
        innerTitle(){
            return this.$store.state.core.pageTitle;
        },
        renderLayout(){//是否开始渲染布局
            if(!this.lazy){//非延迟渲染模式，即时渲染
                return true;
            }else{//延迟渲染模式，预处理完毕后渲染
                return this.lazy&&this.preprocessed;
            }
        }
    },
    created(){
        if(this.noPage){
            return;
        }
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

