import  pageHelper from "../meta-page/page-helper";
var showResultInterval=null;
var showResultIntervalCount=0;
export default {
    props: {
        settings: {
            type: Object,
            default: function () {
                return {};
            }
        }
    },
    data(){
        let comId=this.getComId();
        let parentPage=pageHelper.getParentPage(this);
        let comConfig = parentPage && pageHelper.getComConfig(parentPage.getPageSettings(), comId);
        let dataVal={
            parentPage:parentPage,
            comConfig:comConfig,
            visible:null,
            innerSettings:this.settings,
            continueRender:1,
            showResultResolved:false
        }
        return dataVal;
    },
    computed:{
      isShow(){
          if(this.visible!=null){
              return this.visible;
          }
          let comId=this.getComId();
          let parentPage=this.parentPage;
          let comRule = parentPage && pageHelper.getComConfig(parentPage.getPageSettings(), comId);
          if(comRule!=null && !_.isEmpty(comRule.visible)){
              return pageHelper.evalExpr(comRule.visible,parentPage.getPageContext());
          }
          return true;
      }
    },
    render(createElement) {
        if(!this.isShow){
            return null;
        }
        if(!this.continueRender){
            return null;
        }
        let comType = this.settings["ctype"];
        if (comType == null) {
            comType = "m-layout";
        }
        //这里全部传递到attrs中，vue会自动把props的属性提取出来填充的，这样在控件内部就可以通过this.$attrs自动提取非props属性了
        let params = {
            attrs: _.cloneDeep(this.innerSettings),
            props: this.innerSettings,
            on: this.$listeners,
            nativeOn:{}
        };

        let parentPage = this.parentPage;
        if (parentPage == null) {
            return createElement(comType, params);
        }

        if(comType=="m-layout"){
            let parentLayout=pageHelper.getParentLayout(this);
            if(parentLayout!=null){
                this.$set(params.props,"itemProcessor",parentLayout.itemProcessor);
            }
        }

        let comId=this.getComId();
        let comConfig = this.comConfig;
        let _self=this;
        //处理动态属性
        if (comConfig && comConfig.props) {
            if(comConfig.props){
                _.forIn(comConfig.props,(val,prop)=>{
                    Object.defineProperty(params.props,prop, {
                        get: function () {
                            if(_.isFunction(val)){
                                return val.apply(_self,[parentPage.getPageContext()]);
                            }
                            return pageHelper.evalExpr(val,parentPage.getPageContext());
                        },
                        configurable:true
                    });
                });
            }
            //需要区分自定义事件$emit抛出的，和native浏览器原生事件
            let nativeEvents={},customEvents={};
            _.forIn(comConfig.events,(evt,key)=>{
                if(_.endsWith(key,'.native')||_.endsWith(key,'-native')){
                    nativeEvents[key.substring(0,key.length-7)]=evt;
                }else{
                    customEvents[key]=evt;
                }
            });
            params.on = _.extend(params.on, customEvents);
            params.nativeOn=nativeEvents;
        }
        //处理slots
        if(this.innerSettings.slots){
            let slotDefs=this.innerSettings.slots;
            let scopedSlots={};
            params["scopedSlots"]=scopedSlots;
            if(slotDefs.ctype){
                scopedSlots["default"]= (subProps)=> {
                    return createElement("m-component",{props:{settings:slotDefs}});
                }
            }else{
                _.forIn(slotDefs,(slotDef,slotName)=>{
                    scopedSlots["slotName"]=(subProps)=> {
                        return createElement("m-component",{props:{settings:slotDef}});
                    }
                });
            }
        }
        //将on-inited事件中updateModel操作移到表单组件中再执行一次，因为page初始化时m-form还未初始化，执行updateModel会失败
        if(comType==='m-form'||comType==='meta-form'){
            let oldOnInitiated=params.props.onInited;
            params.props.onInited=function(){
                oldOnInitiated&&oldOnInitiated();
                parentPage.initPageEvent&&parentPage.initPageEvent('updateModel');
            }
        }
        let el = createElement(comType, params);
        parentPage.registerComponent(comId, el);
        //这里注册之后才标记事件规则中的show操作执行成功，保证下一个的action执行时context中组件实例是新的
        this.showResultResolved=true;
        return el;
    },
    methods:{
        getComId(){
            let comId = null;
            if (_.has(this.settings, "id")) {
                comId = this.settings["id"];
            }
            if (comId == null && this.settings["name"]) {
                comId = _.camelCase(this.settings["name"]);
            }
            if (comId == null) {
                comId = this.settings["ctype"];
            }
            return comId;
        },
        show(){
            this.visible=true;
            showResultIntervalCount=0;
            this.showResultResolved=false;
            //这里返回一个Promise，必须在show完成注册后标记当前show操作是执行成功的，保证下一个的action执行时context中组件实例是新的
            let showResult=new Promise((resolve,reject)=>{
                showResultInterval=setInterval(()=> {
                    showResultIntervalCount++;
                    //这里定时器最多跑20次后自动清除，避免性能损耗
                    if(this.showResultResolved||showResultIntervalCount>20){
                        clearInterval(showResultInterval);
                        resolve(true);
                    }
                }, 300);
            });
            return showResult;
        },
        hide(){
            this.visible=false;
            return Promise.resolve(true);
        },
        setVisible(visible){
            if(visible){
                return this.show();
            }else{
                return this.hide();
            }
        }
    }
}
