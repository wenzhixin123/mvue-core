import contextHelper from "../../../libs/context";

/**
 *  返回操作
 */

var operation= {
    name:"goback",
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





