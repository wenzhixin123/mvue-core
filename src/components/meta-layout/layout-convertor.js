import propParser from '../../services/tool/prop_parser';
import attachPropsProcessor from './attach-props-processor';
import contextHelper from "../../libs/context";

function convertSettings(_settings,curInst,options){
    var temp=null;
    //对于只有一个组件的情况，自动转换为一列一行的布局
    if(_settings.ctype){
        if(_settings.ctype=="m-page"){
            temp=_settings;
        }else{
            temp = {
                layout:[_settings],
                propSettings:_settings["propSettings"],
                rules:_settings["rules"]
            };
        }
    }else if(_settings.layout&&_settings.layout.ctype){//只有一个组件，并且用layout套起来的
        temp = {
            layout:[_settings.layout]
        };
    }else{
        temp = _settings;
    }
    //预处理，添加一些默认的组件配置属性，如meta-form的recordId来源
    attachPropsProcessor.process(temp.layout,options);
    parseProps(temp.layout,curInst);
    return temp;
}

function parseProps(layout,curInst){
    let evalContext={
        query:curInst.$route.query,
        path:curInst.$route.params,
        context:curInst.widgetContext,
        config:contextHelper.getConfig()
    };
    visitObj(layout,(itemNode,parent,indexOrKey)=>{
        let isInMForm=parent&&(parent.ctype=="meta-form"||parent.ctype=="m-form");
        if(isInMForm&&indexOrKey=="pageTitleTmpl"){
            return;
        }
        if(_.isString(itemNode)){
            let newVal=evalTemplate(itemNode,evalContext);
            parent[indexOrKey]=newVal;
            return;
        }
        if(itemNode.value&&itemNode.value.from){
            itemNode.type=itemNode.type||"text";
            let _v=propParser.parse(itemNode,curInst);
            parent[indexOrKey]=_v;
            return;
        }
        let isMForm=itemNode&&(itemNode.ctype=="meta-form"||itemNode.ctype=="m-form");
        if(isMForm){
            if(curInst.operation&&curInst.operation.name=="create"){
                itemNode.recordId=null;
            }
            //m-tree-grid组件附加的表单参数
            if(curInst.widgetContext&&curInst.widgetContext.grid&&curInst.widgetContext.grid.createParams){
                itemNode.createParams=_.cloneDeep(curInst.widgetContext.grid.createParams);
            }
            //处理表单只读
            if(isViewForm(curInst.$route.query)){
                itemNode["forceView"]=true;
            }
        }
    });
}

function isViewForm(query) {
    if(_.isEmpty(query)){
        return false;
    }
    let utils=contextHelper.getMvueToolkit().utils;
    let action=query[utils.queryKeys.action];
    return utils.formActions.view===action;
}

function evalTemplate(tpl,evalContext) {
    let newVal=evalMessage(tpl);
    let isFunc=evalFunc(newVal);
    if(typeof isFunc=="function"){
        return isFunc;
    }
    if(tpl.indexOf("${")>-1 || tpl.indexOf("<%")>-1){
        let compiled=_.template(tpl);
        try{
            newVal=compiled(evalContext);
        }catch(e){
            console.log(e);
        }
    }else if(tpl.indexOf("{{")>-1){
        let bak=_.templateSettings.interpolate;
        try{
            _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
            let compiled=_.template(tpl);
            newVal=compiled(evalContext);
        }catch(e){
            console.log(e);
        }finally {
            _.templateSettings.interpolate=bak;
        }
    }
    return newVal;
}

/**
 * 国际化处理,语法@{messageKey}
 * @param tpl
 * @returns {*}
 */
function evalMessage(tpl) {
    if(!tpl){
        return tpl;
    }
    let messages=contextHelper.getConfig("messages") ||{};
    let replaced= tpl.replace(/@{([\s\S]+?)}/g,function () {
        let messageKey=arguments[1];
        return messages[messageKey];
    });
    return replaced;
}

/**
 * 判断当前内容是否为函数，如果是，则转换为函数对象返回
 * @param tpl
 */
function evalFunc(tpl) {
   if(tpl && tpl.indexOf("function(")==0){
       let func=eval("("+tpl+")");
       return func;
   }
   return tpl;
}

/**
 * 提供对layout的递归遍历，
 * @param layout 页面layout对象
 * @param process 组件处理函数，函数接收以下参数：process(widget,parent,indexOrKey)
 * @param parent 父级对象
 * @param indexOrKey 当前组件在父组件中位置（数组的索引值，或Map的key）
 */
function visit(layout,process,parent,indexOrKey) {
    if(_.isArray(layout)){
        _.forEach(layout,(widget,index)=>{
            if(_.isPlainObject(widget) || _.isArray(widget)){
                visit(widget,process,layout,index);
            }
        });
    }
    if(_.isPlainObject(layout)){
        if(_.has(layout,"ctype")){
            process(layout,parent,indexOrKey);
        }
        _.forIn(layout,(widget,key)=>{
            if(_.isPlainObject(widget) || _.isArray(widget)){
                visit(widget,process,layout,key);
            }
        });
    }
}

/**
 * 遍历对象
 * @param obj
 * @param process
 * @param parent
 * @param indexOrKey
 */
function visitObj(obj,process,parent,indexOrKey) {
    if(obj){
        process(obj,parent,indexOrKey);
    }
    if(_.isArray(obj)){
        _.forEach(obj,(item,index)=>{
            visitObj(item,process,obj,index);
        });
    }
    if(_.isPlainObject(obj)){
        _.forIn(obj,(propVal,propKey)=>{
            visitObj(propVal,process,obj,propKey);
        });
    }
}


export default {
    convert:convertSettings,
    visit:visit
};
