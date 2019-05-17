import expr from "../../libs/evaluate/expr"
import  contextHelper from  "../../libs/context";

const ComConfigKeyName="$config";
const PageSelfKey="$page";
const PageEventsKey="events";
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
    if(pageSettings==null){
        return;
    }
    pageSettings[ComConfigKeyName]={};
    processComSettings(pageSettings,context);
    processComRules(pageSettings,context);
    return pageSettings;
}

/**
 * 获取组件相关的规则配置
 * @param pageSettings
 * @param cId
 * @returns {*}
 */
function getComConfig(pageSettings, cId) {
    let rules=pageSettings[ComConfigKeyName];
    if(!rules){
        return null;
    }
    let com=rules[cId];
    return com;
}


/**
 *
 * @param pageSettings
 * @param context
 * @returns {*}
 */
function processComSettings(pageSettings,context) {
    let settings = pageSettings.propSettings;
    let comConfigs = pageSettings[ComConfigKeyName];
    if (!settings) {
        return null;
    }
    _.forIn(settings, (val, key) => {
        let keyInfo = resolveRuleKey(key);
        let comConfig = comConfigs[keyInfo.comId];
        if (comConfig == null) {
            comConfig = defaultComConfig();
            comConfigs[keyInfo.comId] = comConfig;
        }
        if (_.isString(val)) {
            comConfig.visible = val;
        } else {
            comConfig.props = val;
        }
        if (_.has(comConfig.props, "visible")) {
            comConfig.visible = comConfig.props["visible"];
            delete comConfig.props["visible"];
        }
        return;
    });
    return comConfigs;
}

/**
 * 对pageSettings中的rules进行解析
 * @param rules
 * @param context
 * @returns {null}
 */
function processComRules(pageSettings,context) {
    let rules=pageSettings[PageEventsKey];
    let comConfigs=pageSettings[ComConfigKeyName];
    if(!rules){
        return null;
    }
    _.forIn(rules,(val,key)=>{
        let keyInfo=resolveRuleKey(key);
        let comId=keyInfo.comId;
        if(comId==""){
            comId=PageSelfKey;
        }
        let comConfig=comConfigs[comId];
        if(comConfig==null){
            comConfig=defaultComConfig();
            comConfigs[comId]=comConfig;
        }
        if(keyInfo.eventName==null){
            return;
        }
        comConfig.events[keyInfo.eventName]=buildEventListener(val,keyInfo,context);
    });
    return comConfigs;
}

/**
 * 根据设置信息，生成事件的处理器
 * @param options
 * @param eventInfo
 * @param context
 * @returns {Function}
 */
function buildEventListener(options,eventInfo,context) {
    let condition=true;
    let actions=[];
    if(_.isArray(options)){
        _.forEach(options,(param)=>{
            let action=buildAction(param,eventInfo);
            actions.push(action);
        });
    }else if(_.isPlainObject(options)){
        condition=options.if||true;
        _.forEach(options.do,(param)=>{
            let action=buildAction(param,eventInfo);
            actions.push(action);
        });
    }

    return function () {
        let ifVal=null;
        if(typeof condition=="boolean"){
            ifVal=condition;
        }else if(_.isString(condition)){
            ifVal=evalExpr(condition,context,false);
        }else{
            ifVal=false;
        }
        if(ifVal){
            _.forEach(actions,(action)=>{
                action.exec(context);
            });
        }
    }
}

/**
 * 组件配置的基本结构
 * @returns {{if: null, events: {}, props: {}}}
 */
function defaultComConfig() {
    return {
        visible:null,
        props:{},
        events:{}
    };
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

/**
 * 显示控件，action定义：{action:"show",value:"expr",target:"comId"}
 * @param action
 * @param context
 * @param event
 */
actions["show"]=function actionForShow(action,context,event) {
    let isShow = true;
    if (!_.isEmpty(action.value)) {
        isShow = evalExpr(action.value, context, false);
    }

    if (_.isArray(action.target)) {
        _.forEach(action.target, (comId) => {
            let com = context[comId];
            if (com && com.$parent) {
                com.$parent.setVisible(isShow);
            }
        })
    } else {
        let com = context[action.target];
        if (com && com.$parent) {
            com.$parent.setVisible(isShow);
        }
    }
}

actions["hide"]=function actionForShow(action,context,event) {
    if (_.isArray(action.target)) {
        _.forEach(action.target, (comId) => {
            let com = context[comId];
            if (com && com.$parent) {
                com.$parent.setVisible(false);
            }
        });
    } else {
        let com = context[action.target];
        if (com && com.$parent) {
            com.$parent.setVisible(false);
        }
    }
}

/**
 * 根据选项集，批量设置控件的显示或隐藏，action定义如下：{action:"showByOption",fieldName:"",items:{"option1":["com1","com2"],"option2":["com3",...]}}
 * @param action
 * @param context
 * @param event
 */
actions["showByValue"]=function actionForShowByValue(action,context,event) {
    let fieldVal=null;
    if(action.value) {
        fieldVal=evalExpr(action.value,context);
    }else{
        fieldVal=context.model[event.comId];
    }
    let matchedItems=null;
    _.forIn(action.items,(comIds,key)=>{
        if(key==fieldVal){
            matchedItems=comIds;
            return;
        }
        _.forEach(comIds,(comId)=>{
            let com=context[comId];
            if(com){
                com.$parent.hide();
            }
        });
    });
    if(matchedItems){
        _.forEach(matchedItems,(comId)=>{
            let com=context[comId];
            if(com){
                com.$parent.show();
            }
        });
    }
}

/**
 * 设置控件属性
 * @param action {action:"setProps","target":"comId","props":{"key1":"value1","key2":"value2",...}}
 * @param context
 * @param event
 */
actions["setProps"]=function actionForShow(action,context,event) {
    let target = context[action.target];
    let matchedIf = true;
    if (!_.isEmpty(action.if)) {
        matchedIf = evalExpr(action.if, context, false);
    }
    if(!matchedIf){
        return ;
    }

    let obj=target;
    if(target.$parent && target.$parent.settings){
        obj=target.$parent.settings;
    }
    _.forIn(action.props,(propValExpr,prop)=>{
        let propVal = evalExpr(propValExpr, context, null);
        this.$set(obj,prop,propVal);
    });
}

actions["script"]=function actionForShow(action,context,event) {
    let matchedIf = true;
    if (!_.isEmpty(action.if)) {
        matchedIf = evalExpr(action.if, context, false);
    }
    let script=action.script;
    if (!matchedIf) {
        script=action.falseScript;
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
    //当前路由对象
    Object.defineProperty(pageContext,"$route",{
        get: function () {
            return page.$route;
        },
        enumerable: true
    });
    return pageContext;
}

export default {
    preparePageSettings,
    getComConfig,
    getParentPage,
    getParentLayout,
    evalExpr,
    buildPageContext,
    PageEventsKey
}
