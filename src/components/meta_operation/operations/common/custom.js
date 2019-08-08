/**
 *  列表的创建操作
 */
import contextHelper from "../../../../libs/context";

let operation= {
    name: "custom",
    title: "自定义",
    to:null,
    btnType:"primary",
    onclick:function(context,$optInst) {
        contextHelper.warning("操作未实现");
    }
};


export default  operation;





