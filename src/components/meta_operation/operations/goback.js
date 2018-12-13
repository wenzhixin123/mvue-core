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
    //如果在弹出框里边，关闭弹出框
    if($optInst.$parent&&$optInst.$parent.getParentPopup){
        let popup=$optInst.$parent.getParentPopup();
        if(popup){
            popup.close();
            return;
        }
    }
    contextHelper.getRouter().go(-1);
}
export default  operation





