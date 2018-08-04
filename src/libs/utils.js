import context from "./context";
const utils=Object.assign({},context.getMvueToolkit().utils,{
    operationDisplayField:"display",//部件操作是否显示的属性字段
    widgetMode:{
        editable:"editable",
        invisible:"invisible",
        readonly:"readonly",
        forceView:"forceView"//保留模式，流程表单暂不启用，兼容旧的强制查看模式
    }
});
export default utils;
