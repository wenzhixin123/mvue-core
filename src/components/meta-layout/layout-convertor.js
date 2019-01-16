import propParser from '../../services/tool/prop_parser';
function parseProps(layout,curInst){
    _.forEach(layout,lyt=>{
        _.forIn(lyt,(value,key)=>{
            if(value&&value.value&&value.value.from){
                value.type=value.type||"text";
                let _v=propParser.parse(value,curInst);
                lyt[key]=_v;
            }
        });
        //新建操作会清掉recordId
        let isMForm=lyt.ctype=="meta-form"||lyt.ctype=="m-form";
        if(curInst&&curInst.operation&&curInst.operation.name=="create"&&isMForm){
            lyt.recordId=null;
        }
        //m-tree-grid组件附加的表单参数
        if(isMForm&&curInst.widgetContext.grid&&curInst.widgetContext.grid.createParams){
            lyt.createParams=_.cloneDeep(curInst.widgetContext.grid.createParams);
        }
    });
}
import attachPropsProcessor from './attach-props-processor';
function convertSettings(_settings,curInst,options){
    var temp=null;
    //对于只有一个组件的情况，自动转换为一列一行的布局
    if(_settings.ctype){
        temp = {
            layout:[_settings]
        };
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
export default {convert:convertSettings};