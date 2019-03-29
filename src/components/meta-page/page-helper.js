import expr from "../../libs/evaluate/expr"
import  contextHelper from  "../../libs/context";

const resolvedRulesName="$rules";
let actions={};
//向上找到当前控件所属的Page对象
function getParentPage(el) {
    //不停的向上找父表单组件
    let _parent = el.$parent;
    while (_parent) {
        if (_parent.isPage) {
            return _parent;
        } else {
            _parent = _parent.$parent;
        }
    }
    return null;
}
//向上找到当前控件所属的Page对象
function getParentLayout(el) {
    //不停的向上找父表单组件
    let _parent = el.$parent;
    while (_parent) {
        if (_parent.isLayout) {
            return _parent;
        } else {
            _parent = _parent.$parent;
        }
    }
    return null;
}

/**
 * 对page的settings进行解析处理
 * @param pageSettings
 * @param context
 * @returns {*}
 */
function preparePageSettings(pageSettings,context) {
    let resolvedRules=resolveRules(pageSettings.rules,context);
    pageSettings[resolvedRulesName]=resolvedRules;
    return pageSettings;
}

/**
 * 获取组件相关的规则配置
 * @param pageSettings
 * @param cId
 * @returns {*}
 */
function getComRule(pageSettings,cId) {
    let rules=pageSettings[resolvedRulesName];
    if(!rules){
        return null;
    }
    let com=rules[cId];
    return com;
}

/**
 * 对pageSettings中的rules进行解析
 * @param rules
 * @param context
 * @returns {null}
 */
function resolveRules(rules,context) {
    if(!rules){
        return null;
    }
    let processed={};
    _.forIn(rules,(val,key)=>{
        let keyInfo=resolveRuleKey(key);
        let com=processed[keyInfo.comId];
        if(com==null){
            com={
                if:null,
                props:{},
                events:{}
            };
            processed[keyInfo.comId]=com;
        }
        if(keyInfo.eventName==null){
            if(_.isString(val)){
                com.if=val;
            }else {
                com.props = val;
            }
            if(_.has(com.props,"if")){
                com.if=com.props["if"];
                delete com.props["if"];
            }
            return;
        }
        let actions=[];
        _.forEach(val,(param)=>{
            let action=buildAction(param,keyInfo);
            actions.push(action);
        });
        com.events[keyInfo.eventName]=function () {
            _.forEach(actions,(action)=>{
                action.exec(context);
            });
        }
    });
    return processed;
}

function resolveRuleKey(key) {
    let dotIndex=key.indexOf(".");
    if(dotIndex==-1){
        return {
            comId:key,
            eventName:null
        }
    }
    return {
        comId:key.substring(0,dotIndex),
        eventName:  _.kebabCase(key.substring(dotIndex+1))
    }
}

/**
 * 判断当前对象是不是一个action定义
 * @param val
 * @returns {boolean}
 */
function isAction(val) {
    if(_.isPlainObject(val) &&_.has(val,"action")){
        return true;
    }
    return false;
}

/**
 * 根据参数生成action
 * @param params
 * @returns {{params: *, exec: exec}}
 */
function buildAction(action,event) {
    return {
        params: action,
        event: event,
        exec: function (context) {
            //console.log("exec action:" + JSON.stringify(action));
            let func = actions[action.action];
            if (func == null) {
                console.error(`操作${action.action}不存在`);
            }
            let target = context[event.comId] || context.page;
            func.call(target, action, context, event);
        }
    }
}

actions["show"]=function actionForShow(action,context,event) {
    let com=context[action.params.target];
    let isShow=true;
    if(!_.isEmpty(action.if)){
        isShow=evalExpr(action.if,context,false);
    }
    com.$parent.show=isShow;
}

actions["set"]=function actionForShow(action,context,event) {
    let target = context[action.params.target];
    let matchedIf = true;
    if (!_.isEmpty(action.if)) {
        matchedIf = evalExpr(action.if, context, false);
    }

    let valExpr=action.params.value;
    if (!matchedIf) {
        valExpr=action.params.falseValue;
    }
    if(_.isEmpty(valExpr)){
        return;
    }

    let propVal = evalExpr(valExpr, context, null);
    let comSettings = target.$parent && target.$parent.settings;
    if (comSettings) {
        this.$set(comSettings, action.params.prop, propVal);
    } else {
        this.$set(target,action.params.prop,propVal);
    }
}

actions["script"]=function actionForShow(action,context,event) {
    let matchedIf = true;
    if (!_.isEmpty(action.if)) {
        matchedIf = evalExpr(action.if, context, false);
    }
    let script=action.params.script;
    if (!matchedIf) {
        script=action.params.falseScript;
        return;
    }
    if(_.isEmpty(script)){
        return;
    }
    execScript(script, context);
}


function evalExpr(expression,context,defaultVal) {
    let evalVal=null;
    try{
        evalVal=expr.compile(expression)(context);
    }catch (e) {
        if(e.name=="TypeError"){
            console.warn( `expression ${expression} eval has typeError:${e}`);
        }else{
            console.error( `expression ${expression} eval error:${e}`);
        }
        evalVal=defaultVal;
    }
    return evalVal
}

function execScript(script,context,) {
    let func=new Function(Object.keys(context),script);
    func.apply(context.page,Object.keys(context).map(key=>context[key]));
}

function buildPageContext(page) {
    //定义page的运行Context
    let pageContext={
        page:page,
        vNodes:{},
        $set:function (obj,prop,b) {
            page.$set(obj,prop,b);
            return b;
        }
    };
    //在page上定义一个model属性，由内部form提交实现
    Object.defineProperty(pageContext,"model", {
        get: function () {
            let form=null;
            _.forIn(pageContext.vNodes,(com)=>{
                if(com.componentInstance.isMetaForm){
                    form=com.componentInstance;
                    return false;
                }
            });
            if(form==null){
                return {};
            }
            return form.entity;
        },
        enumerable: true
    });

    //定义$user属性，获取当前用户信息
    Object.defineProperty(pageContext,"$user", {
        get: function () {
            return contextHelper.getSession().getCurrentUser();
        },
        enumerable: true
    });
    return pageContext;
}

export default {
    preparePageSettings,
    getComRule,
    getParentPage,
    getParentLayout,
    evalExpr,
    buildPageContext
}