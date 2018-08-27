import metaformUtils from '../form/js/metaform_utils';
function initValidation(formInst,metaForm){
    //初始化表单验证
    var formItems=metaformUtils.getAllFieldItems(metaForm);
    _.forEach(formItems,function(formItem){
        var rules=metaformUtils.initValidation(formItem,formInst.metaEntity,formInst.entityId);
        if(rules.length>0){
            var existRule=formInst.innerRules[formItem.dataField];
            if(existRule==null){
                formInst.innerRules[formItem.dataField]=rules;
            }else{
                if(_.isArray(existRule)){
                    formInst.innerRules[formItem.dataField]=_.union(existRule,rules);
                }else{
                    rules.push(existRule);
                    formInst.innerRules[formItem.dataField]=rules;
                }
            }
        }
    });
}
function handleFormScript(formInst,metaForm){
    var logistics=metaForm.logistics;
    if(logistics.script){
        let fun= new Function(logistics.script);
        fun.call(formInst);
    }
}
function handleFieldOptionsToggle(formInst,metaForm){//处理选择某个选项时，显示和隐藏某些组件逻辑
    var logistics=metaForm.logistics;
    if(logistics.optionsToggleComponentsConfig){
        //遍历每一个单选项配置的逻辑
        _.forIn(logistics.optionsToggleComponentsConfig,function(value,key){
            let curFormItem=metaformUtils.getFormItemById(metaForm,key);
            //如果此单选项组件存在
            if(curFormItem){
                //选项要控制的组件集合
                let toggleFields=value.toggleFields;
                let dataFields=metaFormUtils.getAllFieldItems(metaForm);
                _.each(dataFields,function(fi,index){
                    if(_.includes(toggleFields,fi.id)){
                        fi.hidden=true;
                    }
                });
                //监听单选项的值变化，从而显示和隐藏其他组件
                formInst.$watch('formData.'+curFormItem.dataField,function(newV,oldV){
                    //选项特殊的可切换字段
                    let visibleFields=value.toggleSetting[newV];
                    if(visibleFields){
                        _.each(dataFields,function(fi,index){
                            if(fi.id===curFormItem.id){
                                fi.hidden=false;
                            }else if((!_.includes(visibleFields,fi.id))&&_.includes(toggleFields,fi.id)){
                                fi.hidden=true;
                            }else{
                                fi.hidden=false;
                            }
                        });
                    }
                });
            }
        });
    }
}
export default{
    initValidation,
    handleFormScript,
    handleFieldOptionsToggle
}