import contextHelper from "../../../../libs/context";

/**
 *  表单的保存操作
 */

var operation= {
    name:"save",
    title:"保存",
    icon:"",
    operationType:"common",
    type:"primary",
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};

function impl(context,$optInst){
    var form=context.form;
    if(_.isNil(form)){
        contextHelper.error({content:`表单保存操作必须传入表单实例参数`});
        return;
    }
    form.doSaveModel();
}
export default  operation





