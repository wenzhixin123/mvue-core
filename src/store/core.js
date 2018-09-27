const state = {
  currentRouteData:{},//当前路由的公共数据
  autoPageConfs:{}//当前系统所有动态页面组件的配置集合
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
  }
}

export default {
  namespaced: true,//访问时需要带上模块名称作为路径前缀
  state,
  getters,
  actions,
  mutations
}