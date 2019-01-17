const state = {
  currentRouteData:{},//当前路由的公共数据
  autoPageConfs:{},//当前系统所有动态页面组件的配置集合
  pageTitle:'',//当前页面的标题
  pageTitleSourceId:'',//当前页面的title来自哪个id的组件
  gridStatus:{},//存储m-grid组件的查询参数对象
  defaultFormId:'default-form-id',
  formStatus:{refEntities:{}},//存储表单的状态数据，key为表单id
  accessMode:'',//当前页面执行权限模式：可由菜单的url参数指定、m-grid的属性控制
  topEntityRow:''//格式：{entityName}/{recordId}，当前页面开启上下文模式，后续所有实体如果和{entityName}实体有多对一关系，查询此实体则自动附加{recordId}过滤
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
  },
  setFormRefEntities(state,{formId,name,refEntity}){
    let key=formId||state.defaultFormId;//如果只有一个表单，不需要设置m-form的id属性，过个需要设置
    let refEntities=state.formStatus.refEntities;
    refEntities[key]=refEntities[key]||{};
    let curFormRefEntities=refEntities[key];
    curFormRefEntities[name]=refEntity;
    state.formStatus.refEntities=_.cloneDeep(state.formStatus.refEntities);
  },
  setAccessMode(state,accessMode){
    state.accessMode=accessMode;
  },
  setTopEntityRow(state,topEntityRow){
    state.topEntityRow=topEntityRow;
  }
}

export default {
  namespaced: true,//访问时需要带上模块名称作为路径前缀
  state,
  getters,
  actions,
  mutations
}