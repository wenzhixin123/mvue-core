const optionTitleKey='text';
/**
 * @param metaField 元数据字段
 * @param optionId 选项id值，也可以为数组，返回数据类型和optionId相同，如果为数组返回数组对应个optionId的text
 * TODO others: var othersId=this.formItem.componentParams.otherOptions.id;
 */
function getOptionText(metaField,optionId){
    if(!metaField.inputTypeParams.options){
        return '';
    }
    var initOptions=metaField.inputTypeParams.options;
    var options=_.keyBy(initOptions,opt=>{return opt.id});
    if(_.isNil(optionId)){
        return '';
    }
    if(_.isArray(optionId)){
        let i=0,titles=[],pOptions=options;
        while(i<optionId.length){
            let _optionId=optionId[i];
            let _title='';
            _title=pOptions[_optionId]&&pOptions[_optionId][optionTitleKey];
            titles.push(_title||'');
            if(pOptions[_optionId].children){
                let children=pOptions[_optionId].children;
                pOptions=_.keyBy(children,opt=>{return opt.id});
            }
            ++i;
        }
        return titles;
    }else{
        return (options[optionId]&&options[optionId][optionTitleKey])||'';
    }
}
export default {getOptionText};