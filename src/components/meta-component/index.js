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
        let comRule = parentPage && pageHelper.getComRule(parentPage.getPageSettings(), comId);
        let dataVal={
            parentPage:parentPage,
            comRule:comRule,
            show:null
        }
        return dataVal;
    },
    computed:{
      isShow(){
          if(this.show!=null){
              return this.show;
          }
          let comId=this.getComId();
          let parentPage=this.parentPage;
          let comRule = parentPage && pageHelper.getComRule(parentPage.getPageSettings(), comId);
          if(comRule!=null && !_.isEmpty(comRule.if)){
              return pageHelper.evalExpr(comRule.if,parentPage.getPageContext());
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
            props: this.settings,
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
        let comRule = this.comRule;
        if (comRule) {
            if (comRule.if && _.isFunction(comRule.if)) {
                let ifVal = comRule.if();
                if (ifVal === false) {
                    return null;
                }
            }
            if(comRule.props){
                _.forIn(comRule.props,(val,prop)=>{
                    Object.defineProperty(params.props,prop, {
                        get: function () {
                            return pageHelper.evalExpr(val,parentPage.getPageContext());
                        },
                        configurable:true
                    });
                });
            }
            params.on = _.extend(params.on, comRule.events);
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
                comId = _.camelCase(this.settings["ctype"]);
            }
            return comId;
        }
    }
}