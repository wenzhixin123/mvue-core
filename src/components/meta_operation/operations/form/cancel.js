import contextHelper from "../../../../libs/context";

/**
 *  表单的取消操作
 */


var operation= {
    name:"cancel",
    title:"返回",
    icon:"",
    operationType:"common",
    btnType:"default",
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};

function impl(context,$optInst){
    contextHelper.getRouter().go(-1);
}
export default  operation





