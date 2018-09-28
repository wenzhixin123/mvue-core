import propParser from '../../services/tool/prop_parser';
import context from '../../libs/context';
function parseProps(layout,curInst){
    _.forEach(layout,lyt=>{
        _.forIn(lyt,(value,key)=>{
            if(value.value&&value.value.from){
                value.type=value.type||"text";
                let _v=propParser.parse(value,curInst,context.getRouter());
                lyt[key]=_v;
            }
        });
    });
}
function convertSettings(_settings,curInst){
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
    parseProps(temp.layout,curInst);
    return temp;
}
export default {convert:convertSettings};