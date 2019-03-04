import propParser from '../../services/tool/prop_parser';
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

function parseProps(layout,curInst){
    let evalContext={
        query:curInst.$route.query,
        path:curInst.$route.params,
        context:curInst.widgetContext
    };
    visitObj(layout,(itemNode,parent,indexOrKey)=>{
        if(_.isString(itemNode) && itemNode.indexOf("${")>-1){
            let compiled=_.template(itemNode);
            let newVal=compiled(evalContext);
            parent[indexOrKey]=newVal;
            return;
        }
        if(itemNode.value&&itemNode.value.from){
            itemNode.type=itemNode.type||"text";
            let _v=propParser.parse(itemNode,curInst);
            parent[indexOrKey]=_v;
            return;
        }

        let isMForm=itemNode.ctype=="meta-form"||itemNode.ctype=="m-form";
        if(isMForm){
            if(curInst.operation&&curInst.operation.name=="create"){
                itemNode.recordId=null;
            }
            //m-tree-grid组件附加的表单参数
            if(curInst.widgetContext&&curInst.widgetContext.grid&&curInst.widgetContext.grid.createParams){
                itemNode.createParams=_.cloneDeep(curInst.widgetContext.grid.createParams);
            }
        }
    });
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