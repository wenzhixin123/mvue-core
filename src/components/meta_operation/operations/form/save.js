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
    //判断是否是弹出的表单
    var isInPopup=!!form.getParentPopup();
    form.doSaveModel().then((res)=>{
        if(form.completedAction=="close"&&(!res.createAnother)){
            if(isInPopup){
                form.$emit("popup-close");
            }else{
                contextHelper.getRouter().go(-1);
            }
        }else{
            //创建模式，未设置completedAction
            if(res&&res.isCreate&&(!res.createAnother)){
                contextHelper.getRouter().go(-1);
            }
        }
        if(_.isFunction(operation.onSuccess)){
            operation.onSuccess(res,form);
        }
    },(err)=>{});
}
export default  operation





