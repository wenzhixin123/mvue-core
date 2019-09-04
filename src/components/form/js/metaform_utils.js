import constants from './constants';
import controlTypeService from '../../form/js/control_type_service';
import contextHelper from "../../../libs/context";
import {t} from '../../../locale'

var linkplugin=require('../../../services/link/linkplugin');


//"lessThan", "biggerThan", "equals"
function compareRuleValidate(op,value,comparedFieldValue){
    if(op==="lessThan"){
        return value<=comparedFieldValue;
    }else if(op==="biggerThan"){
        return value>=comparedFieldValue;
    }else if(op==="equals"){
        return value==comparedFieldValue;
    }
    return false;
}
function compareRuleMessage(op,fieldName,metaEntity){
    var title = metaEntity.findField(fieldName).title||fieldName;
    var msg="";
    if(op==="lessThan"){
        msg=t('m.validation.lessThan',{field:title});
    }else if(op==="biggerThan"){
        msg=t('m.validation.biggerThan',{field:title});
    }else if(op==="equals"){
        msg=t('m.validation.equals',{field:title});
    }
    return msg;
}
function buildValidationRuleForCompare(compareToFieldName,operator,entity,metaEntity){
    let _compareRule={
        validator(rule, value, callback) {
            if(!value){
                callback();
                return;
            }
            var comparedFieldValue=entity[compareToFieldName];
            if(!comparedFieldValue){
                callback();
                return;
            }
            var ok=compareRuleValidate(operator,value,comparedFieldValue);
            if(ok){
                callback();
            }else{
                callback(rule.message);
            }
        },
        message:compareRuleMessage(operator,compareToFieldName,metaEntity)
    }
    return _compareRule;
}
function buildValidationRuleForRequired(field){
    let msg=t('m.validation.required',{field});
    return {
        required: true,message:msg
    };
}
function buildValidationRuleForJson(){
    let msg=t('m.validation.json');
    let _rule={
        validator(rule, value, callback) {
            if(!value){
                callback();
                return;
            }
            if(_.isPlainObject(value)&&value.jsonError){
                callback(rule.message);
                return;
            }else{
                callback();
            }
        },
        message:msg,
        trigger: 'blur'
    }
    return _rule;
}
function buildPatternRules(params,fieldTitle,entity,metaEntity){
    let onePatternRule=params.validation 
        && params.validation.validate 
        && params.validation.rule 
        && params.validation.rule.pattern;
    let onePatternRule2= params.validation && params.validation.pattern ;  
    let hasRules=params.validation && params.validation.rules;
    let hasRules2=params.rules;
    let __rules=hasRules||hasRules2;
    let has=onePatternRule||onePatternRule2||__rules;
    if (has) {
        let rules=[];
        let _msg=t('m.validation.pattern',{field:fieldTitle});
        if(!_.isEmpty(__rules)){
            rules=rules.concat(_.cloneDeep(__rules));
            let _rules=[];
            _.forEach(rules,r=>{
                if(!r.message){
                    r.message=_msg;
                }
                //特殊转换一下字段比较类型的验证规则
                if(entity
                    && metaEntity
                    && r.type==='compare'
                    && _.includes(["lessThan", "biggerThan", "equals"], r.operator)
                    && r.fieldName){
                    let _compareRule=buildValidationRuleForCompare(r.fieldName,r.operator,entity,metaEntity);
                    _rules.push(_compareRule);
                }else{
                    _rules.push(r);
                }
            });
            rules=_rules;
        }else if(onePatternRule2){
            rules.push({
                type: "string",
                pattern: params.validation.pattern,
                message: _msg
            });
        }else if(onePatternRule){
            rules.push({
                type: "string",
                pattern: params.validation.rule.pattern,
                message: _msg
            });
        }
        return rules;
    }
    return false;
}
function buildValidationRuleForTag(params,fieldTitle){
    let _vRules=buildPatternRules(params,fieldTitle);
    if(_vRules){
        let _msg=t('m.validation.pattern',{field:fieldTitle});
        let _rule={
            type:"array",
            message: _msg
        };
        let _len=params.validation.len||params.validation.length;
        if(_len&&_len>0){
            _rule.len=_len;
            _rule.message=`${_rule.message}，并且至多添加${_rule.len}个`;
        }
        _rule.defaultField=_vRules;
        return _rule;
    }
    return false;
}
//初始化字段组件的验证规则，async-validator验证时，按rules顺序进行验证
function initValidation(formItem,metaEntity,dataId,entity,ignoreRequiredValidate) {
    if (!formItem.isDataField) {
        return null;
    }

    var fieldName = formItem.dataField;
    var params = formItem.componentParams;
    var fieldTitle=formItem.componentParams.title;
    var metaField=formItem.isDataField && metaEntity.findField(formItem.dataField);

    var rules = [];
    //必填必须放在第一个，否则label前的红色星号不生效，应该是iview的bug
    if (params.required&&(!ignoreRequiredValidate)) {
        rules.push(buildValidationRuleForRequired(fieldTitle));
    }
    let isOptions=metaField&&controlTypeService.isOptions(metaField.inputType);
    let isStringType=metaField&&metaField.type=='string'&&(!isOptions);
    let isJsonText=metaField&&metaField.inputType==controlTypeService.componentTypes.JsonText.id;
    let isTag=metaField&&metaField.inputType==controlTypeService.componentTypes.Tag.id;
    if(isJsonText){
        //添加json校验
        let jsonRule=buildValidationRuleForJson();
        rules.push(jsonRule);
    }
    if(isTag){
        //添加tag校验
        let tagRule=buildValidationRuleForTag(params,fieldTitle);
        if(tagRule){
            rules.push(tagRule);
        }
    }
    //长度验证
    if (isStringType && params.limitLength && params.limitLength.limit) {
        var lenRule = {
            type: "string",
        };
        rules.push(lenRule);
        let lenMsg='';
        if (params.limitLength.max > 0) {
            lenRule.max = params.limitLength.max;
            lenMsg=t('m.validation.maxLen',{field:fieldTitle,max:params.limitLength.max});
        }
        if (params.limitLength.min > 0) {
            lenRule.min = params.limitLength.min;
            lenMsg=t('m.validation.minLen',{field:fieldTitle,min:params.limitLength.min});
        }
        if(params.limitLength.max > 0 && params.limitLength.min > 0){
            lenMsg=t('m.validation.rangeLen',{field:fieldTitle,min:params.limitLength.min,max:params.limitLength.max});
        }
        lenRule["message"]=lenMsg;
    }
    let isNumber=metaField&&controlTypeService.isNumber(metaField.inputType);
    //验证规则
    if (isStringType||isNumber) {
        let _vRules=buildPatternRules(params,fieldTitle,entity,metaEntity);
        if(_vRules){
           rules=rules.concat(_vRules);
        }
    }
    if (params.validation  && params.validation.validate  && params.validation.rule
        && params.validation.rule.type === 'compare'
        && _.includes(["lessThan", "biggerThan", "equals"], params.validation.rule.operator)
        && params.validation.rule.fieldName
    ) {
        let _compareRule=buildValidationRuleForCompare(params.validation.rule.fieldName,params.validation.rule.operator,entity,metaEntity);
        rules.push(_compareRule);
    }

    //数值范围
    var rangeRule = {
        type: "number",
    };
    //负数限制，此时需要和limitRange规则合并
    if (params.allowNegative===false) {
        if (params.limitRange && params.limitRange.limit){
            params.limitRange.min=params.limitRange.min>0?params.limitRange.min:0;
        }else{
            params.limitRange={
                limit:true,
                min:0
            }
        }
    }
    if (params.limitRange && params.limitRange.limit) {
        rules.push(rangeRule);
        let rangeMsg='';
        if (_.isNumber(params.limitRange.max)) {
            rangeRule.max = params.limitRange.max;
            rangeMsg=t('m.validation.max',{field:fieldTitle,max:params.limitRange.max});
        }
        if (_.isNumber(params.limitRange.min)) {
            rangeRule.min = params.limitRange.min;
            rangeMsg=t('m.validation.min',{field:fieldTitle,min:params.limitRange.min});
        }
        if(_.isNumber(params.limitRange.min)&& _.isNumber(params.limitRange.max)){
            rangeMsg=t('m.validation.range',{field:fieldTitle,min:params.limitRange.min,max:params.limitRange.max});
        }
        rangeRule["message"]=rangeMsg;
    }
    //唯一性校验
    if (params.unique && metaField && metaField.filterable) {
        var uniqueRule = {
            validator(rule, value, callback) {
                if(!value){
                    callback();
                    return;
                }
                var params = {};
                params[fieldName] = value;
                var resource=metaEntity.dataResource();
                contextHelper.getMvueToolkit().utils.smartAction(contextHelper.getCurrentVue(),"__"+metaField.name,function() {
                    resource.query(params)
                        .then(function ({data}) {
                            //创建模式dataId为空，如果有数据返回则表示重复了
                            if ((!dataId) && data.length > 0) {
                                callback(rule.message);
                                return;
                            }
                            //编辑模式，当且仅当返回的数据条数为一，且id和dataId相同才合法
                            var idField = metaEntity.getIdField();
                            if (dataId && data.length === 1 && dataId === data[0][idField.name]) {
                                callback();
                                return;
                            } else if (dataId && data.length) {//编辑模式，有返回数据并且不满足第一条if的合法性，则重复
                                callback(rule.message);
                                return;
                            }
                            callback();
                        });
                },500);
            },
            message: t('m.validation.unique',{field:fieldTitle})
        };
        rules.push(uniqueRule);
    }
    return rules;
}
//根据表单布局项，计算组件对应的渲染组件（pclink将使用原生选人控件）
function metaComponentType(formItem){
    var ct=_.kebabCase(formItem.componentType);
    if(controlTypeService.isOrguserType(ct)){
        if(linkplugin.isInPc){//pclink将使用原生选人控件
            return `m-pclink-${ct}`;
        }else{
            return `m-${ct}`;
        }
    }else{
        return `m-${ct}`;
    }
}
export default{
    initValidation:initValidation,
    metaComponentType:metaComponentType,
    buildValidationRuleForCompare,
    buildValidationRuleForRequired
}