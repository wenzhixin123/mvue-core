import contextHelper from "../../../../libs/context";

/**
 *  表单的取消操作
 */


var operation= {
    name:"cancel",
    title:"取消",
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
            popup.popupWidgetModal=false;
            return;
        }
    }
    //否则跳转到上一页面
    contextHelper.getRouter().go(-1);
}
export default  operation





