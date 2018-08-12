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
//初始化字段组件的验证规则
function initValidation(formItem,metaEntity,dataId) {
    if (!formItem.isDataField) {
        return null;
    }

    var fieldName = formItem.dataField;
    var params = formItem.componentParams;

    var rules = [];
    //唯一性校验
    if (params.unique) {
        var uniqueRule = {
            validator(rule, value, callback) {
                var params = {};
                params[fieldName] = value;
                contextHelper.getMvueToolkit().http.get(metaEntity.resourceUrl, {params: params})
                    .then(function ({data}) {
                        callback(rule.message);
                    });
            },
            message: `${formItem.title}重复`
        };
        rules.push(uniqueRule);
    }
    //验证规则
    if (params.validation
        && params.validation.validate
        && params.validation.rule
        && params.validation.rule.pattern) {
        rules.push({
            type: "regexp",
            pattern: params.validation.rule.pattern
        });
    }
    if (params.validation
        && params.validation.validate
        && params.validation.rule
        && params.validation.rule.type === 'compare'
        && _.includes(["lessThan", "biggerThan", "equals"], params.validation.rule.operator)
        && params.validation.rule.fieldName
    ) {
        //TODO:
        //rule[params.validation.rule.operator]=[params.validation.rule.fieldName,params.validation.rule.fieldTitle||params.validation.rule.fieldName];
    }
    //长度验证
    if (params.limitLength && params.limitLength.limit) {
        var lenRule = {
            type: "string",
        };
        rules.push(lenRule);
        if (params.limitLength.max > 0) {
            lenRule.max = [params.limitLength.max];
        }
        if (params.limitLength.min > 0) {
            lenRule.min = [params.limitLength.min];
        }
    }
    //数值范围
    if (params.limitRange && params.limitRange.limit) {
        var rangeRule = {
            type: "number",
        };
        rules.push(rangeRule);
        if (params.limitRange.max > 0) {
            rangeRule.max = [params.limitRange.max];
        }
        if (params.limitRange.min > 0) {
            rangeRule.min = [params.limitRange.min];
        }
    }
    //小数点限制
    if (params.decimal) {
        //小数
        var decimalRule = {
            type: "number",
        };
        rules.push(decimalRule);
        if (!params.decimal.isAllowed) {
            decimalRule.type = "integer";
        }
    }
    //负数限制
    if (params.allowNegative === false) {
        //没有定义最小值或者最小值设置成负数，设置最小值为0
        /* if((!rule.min_value)||(_.startsWith(rule.min_value,"-"))){
             rule.min_value=["0"];
         }*/
        //TODO:
    }

    //必填
    if (params.required) {
        rules.push({
            required: true
        });
    }
    return rules;
}
//表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
function exDataChanged(model,newValue,dataField){
    if(dataField){
        let rkey=constants.entityModelRedundantKey;
        model[rkey]=model[rkey]||{};
        model[rkey][dataField]=model[rkey][dataField]||{};
        model[rkey][dataField]=newValue;
    }
}
//根据表单布局项，计算组件对应的渲染组件（pclink将使用原生选人控件）
function metaComponentType(formItem){
    var ct=formItem.componentType;
    if(controlTypeService.isOrguserType(ct)){
        if(linkplugin.isInPc){//pclink将使用原生选人控件
            return `MetaPclink${ct}`;
        }else{
            return `Meta${ct}`;
        }
    }else{
        return `Meta${ct}`;
    }
}
export default{
    getAllFormItems:getAllFormItems,
    getAllFieldItems:getAllFieldItems,
    formItemByFieldName:formItemByFieldName,
    getFormItemById:getFormItemById,
    indexOfFormItem:indexOfFormItem,
    initValidation:initValidation,
    exDataChanged:exDataChanged,
    metaComponentType:metaComponentType
}