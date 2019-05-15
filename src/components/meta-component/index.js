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
        if (comConfig && comConfig.props) {
            if(comConfig.props){
                _.forIn(comConfig.props,(val,prop)=>{
                    Object.defineProperty(params.props,prop, {
                        get: function () {
                            return pageHelper.evalExpr(val,parentPage.getPageContext());
                        },
                        configurable:true
                    });
                });
            }
            params.on = _.extend(params.on, comConfig.events);
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
