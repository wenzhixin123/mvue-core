import  pageHelper from "../meta-page/page-helper";
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
            innerSettings:this.settings
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
        let comType = this.settings["ctype"];
        if (comType == null) {
            comType = "m-layout";
        }
        let params = {
            attrs: this.$attrs,
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

        let el = createElement(comType, params);
        parentPage.registerComponent(comId, el);
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
        },
        hide(){
            this.visible=false;
        },
        setVisible(visible){
            this.visible=visible;
        }
    }
}
