const state = {
  currentRouteData:{},//当前路由的公共数据
  autoPageConfs:{},//当前系统所有动态页面组件的配置集合
  pageTitle:'',//当前页面的标题
  pageTitleSourceId:'',//当前页面的title来自哪个id的组件
  gridStatus:{}//存储m-grid组件的查询参数对象
}
//公共的计算属性
const getters = {
  //获取当前路由中设置的entityName下的实体数据，用于多对一关系处理
  getEntity: (state, getters) => (entityName) =>{
    var key=entityName.toLowerCase();
    return state.currentRouteData[key];
  },
  autoPageConfs:(state)=>{
    return state.autoPageConfs;
  },
  gridStatus:(state)=>{
    return state.gridStatus;
  }
}
//通过dispatch调用，与mutations不同的是：可以执行任意异步操作
const actions = {
  
}
//通过commit调用：同步操作
const mutations = {
  setEntity (state, {entityName,entity}) {
    var key=entityName.toLowerCase();
    state.currentRouteData[key]=state.currentRouteData[key]||{};
    state.currentRouteData[key]=entity;
    state.currentRouteData=_.cloneDeep(state.currentRouteData);
  },
  setAutoPageConfs (state, autoPageConfs) {
    state.autoPageConfs=autoPageConfs;
  },
  clearCurrentRouteData (state) {
    state.currentRouteData={}
  },
  setPageTitleSourceId(state,sourceId){
    state.pageTitleSourceId=sourceId;
  },
  //强制设置页面标题
  setPageTitleCoercively(state,title){
    state.pageTitle=title;
  },
  setPageTitle(state,{title,sourceId}){
    //如果pageTitle已设置，不再设置
    if(state.pageTitle){
      return;
    }
    if(!state.pageTitleSourceId){//如果页面未指定title来源，谁先来谁先设置
      state.pageTitle=title;
    }else if(sourceId&&(state.pageTitleSourceId===sourceId)){//如果页面指定的source和设置来源一致，则设置生效
      state.pageTitle=title;
    }
  },
  //保存指定key的grid的查询上下文参数对象
  keepGridStatus(state,{key,ctx}){
    state.gridStatus[key]=ctx;
  },
  clearGridStatus(state){
    state.gridStatus={};
  }
}

export default {
  namespaced: true,//访问时需要带上模块名称作为路径前缀
  state,
  getters,
  actions,
  mutations
}