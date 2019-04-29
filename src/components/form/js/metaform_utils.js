import constants from './constants';
import controlTypeService from '../../form/js/control_type_service';
import contextHelper from "../../../libs/context";

var linkplugin=require('../../../services/link/linkplugin');
//因为metaForm加入了容器布局，容器的children包含了子级表单组件
function getAllFormItems(metaForm){
    var formItems=[];
    _.each(metaForm.layout,function(formItem){
        formItems.push(formItem);
        if(formItem.isContainer&&formItem.children&&formItem.children.length>0){
            formItems=formItems.concat(formItem.children);
        }
    });
    return formItems;
}
//返回所有字段组件
function getAllFieldItems(metaForm){
    var formItems=[];
    _.each(metaForm.layout,function(formItem){
        if(formItem.isContainer&&formItem.children&&formItem.children.length>0){
            _.each(formItem.children,function(child){
                if(child.isDataField){
                    formItems.push(child);
                }
            });
        }else{
            if(formItem.isDataField){
                formItems.push(formItem);
            }
        }
    });
    return formItems;
}
//根据字段名称查找组件
function formItemByFieldName(metaForm,fieldName){
    if(!metaForm){
        return null;
    }
    var formItemResult=null;
    _.each(metaForm.layout,function(formItem){
        if(formItem.isContainer&&formItem.children&&formItem.children.length>0){
            _.each(formItem.children,function(child){
                if(child.isDataField&&child.dataField===fieldName){
                    formItemResult=child;
                    return false;//已经找到，跳出内部each循环
                }
            });
            if(formItemResult){//内部已经找到，跳出each循环
                return false;
            }
        }else{
            if(formItem.isDataField&&formItem.dataField===fieldName){
                formItemResult=formItem;
                return false;
            }
        }
    });
    return formItemResult;
}
//根据字段id查找组件
function getFormItemById(metaForm,id){
    if(!metaForm){
        return null;
    }
    var formItemResult=null;
    _.each(metaForm.layout,function(formItem){
        if(formItem.isContainer&&formItem.children&&formItem.children.length>0){
            _.each(formItem.children,function(child){
                if(child.isDataField&&child.id===id){
                    formItemResult=child;
                    return false;//已经找到，跳出内部each循环
                }
            });
            if(formItemResult){//内部已经找到，跳出each循环
                return false;
            }
        }else{
            if(formItem.isDataField&&formItem.id===id){
                formItemResult=formItem;
                return false;
            }
        }
    });
    return formItemResult;
}
//查找组件在布局中的位置索引，如果组件在容器组件里边，需要返回容器组件的index和在容器里的index
function indexOfFormItem(metaForm,formItem){
    var parentIndex=-1,childIndex=-1;
    for(let i=0;i<metaForm.layout.length;++i){
        let _formItem=metaForm.layout[i];
        parentIndex=i;
        if(_formItem.id===formItem.id){
            break;
        }
        if(_formItem.isContainer&&_formItem.children){
            for(let j=0;j<_formItem.children.length;++j){
                let _childFormItem=_formItem.children[j];
                if(_childFormItem.id===formItem.id){
                    childIndex=j;
                    break;
                }
            }
        }
        if(childIndex>-1){
            break;
        }
    }
    if(childIndex>-1){//返回容器组件的index和在容器里的index
        return [parentIndex,childIndex];
    }
    //直接返回index
    return parentIndex;
}
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
    var opDesc="";
    if(op==="lessThan"){
        opDesc="小于";
    }else if(op==="biggerThan"){
        opDesc="大于";
    }else if(op==="equals"){
        opDesc="等于";
    }``
    return `必须${opDesc}${title}的值`;
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
function buildValidationRuleForRequired(fieldTitle){
    return {
        required: true,message:`${fieldTitle}不能为空`
    };
}
function buildValidationRuleForJson(){
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
        message:'JSON格式错误',
        trigger: 'blur'
    }
    return _rule;
}
function buildPatternRules(params,fieldTitle){
    if ((params.validation   && params.validation.validate && params.validation.rule && params.validation.rule.pattern)
        ||  (params.validation && params.validation.pattern)
        ||  (params.validation && params.validation.rules)) {
        let rules=[];
        let _msg=`${fieldTitle}格式不符合`;
        if(params.validation.pattern){
            rules.push({
                type: "string",
                pattern: params.validation.pattern,
                message: _msg
            });
        }else if(params.validation.rules){
            rules=rules.concat(_.cloneDeep(params.validation.rules));
            _.forEach(rules,r=>{
                if(!r.message){
                    r.message=_msg;
                }
            });
        }else{
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
        let _rule={
            type:"array",
            message: `${fieldTitle}格式不符合`
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
        if (params.limitLength.max > 0) {
            lenRule.max = params.limitLength.max;
            lenRule["message"]=`${fieldTitle}长度不能超过${params.limitLength.max}`
        }
        if (params.limitLength.min > 0) {
            lenRule.min = params.limitLength.min;
            lenRule["message"]=`${fieldTitle}长度不少于${params.limitLength.min}`
        }
        if(params.limitLength.max > 0 && params.limitLength.min > 0){
            lenRule["message"]=`${fieldTitle}长度介于${params.limitLength.min}--${params.limitLength.max}`
        }
    }
    //验证规则
    if (isStringType) {
        let _vRules=buildPatternRules(params,fieldTitle);
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
    let rangeAdded=false;
    if (params.limitRange && params.limitRange.limit) {
        rules.push(rangeRule);
        rangeAdded=true;
        if (_.isNumber(params.limitRange.max)) {
            rangeRule.max = params.limitRange.max;
            rangeRule["message"]=`${fieldTitle}必须小于等于${params.limitRange.max}`
        }
        if (_.isNumber(params.limitRange.min)) {
            rangeRule.min = params.limitRange.min;
            rangeRule["message"]=`${fieldTitle}必须大于等于${params.limitRange.min}`
        }
        if(_.isNumber(params.limitRange.min)&& _.isNumber(params.limitRange.max)){
            rangeRule["message"]=`${fieldTitle}必须在${params.limitRange.min}--${params.limitRange.max}之间`
        }
    }
    //负数限制
    if (params.allowNegative===false) {
        //如果最小值没有设置为大于0，设置最小值0
        if(!(_.isNumber(rangeRule.min)&&rangeRule.min>=0)){
            rangeRule.min=0;
            rangeRule["message"]=`${fieldTitle}必须大于等于${params.limitRange.min}`;
            if(!rangeAdded){
                rules.push(rangeRule);
            }
        }
    }
    //小数点限制
    if (params.decimal) {
        //小数
        var decimalRule = {
            type: "number",
            message:`${fieldTitle}必须是数字`
        };
        rules.push(decimalRule);
        if (!params.decimal.isAllowed) {
            decimalRule.type = "integer";
            decimalRule.message=`${fieldTitle}必须是整数`;
        }
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
            message: `${fieldTitle}值重复`
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
    getAllFormItems:getAllFormItems,
    getAllFieldItems:getAllFieldItems,
    formItemByFieldName:formItemByFieldName,
    getFormItemById:getFormItemById,
    indexOfFormItem:indexOfFormItem,
    initValidation:initValidation,
    metaComponentType:metaComponentType,
    buildValidationRuleForCompare,
    buildValidationRuleForRequired
}