import contextHelper from "../../../../libs/context";

/**
 *  表单的保存操作
 */

var operation= {
    name:"save",
    title:"保存",
    icon:"",
    operationType:"common",
    btnType:"primary",
    onSuccess:null,
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
    var operation=$optInst.operation;
    form.doSaveModel().then((res)=>{
        if(res&&res.isCreate){
            if(form.completedAction=="closePopup"){
                form.$emit("popup-close");
            }else{
                contextHelper.getRouter().go(-1);
            }
        }else{
            form.$emit("popup-close");
        }
        if(_.isFunction(operation.onSuccess)){
            operation.onSuccess(res,form);
        }
    });
}
export default  operation





