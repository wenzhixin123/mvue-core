/**
 *  列表的创建操作
 */
import contextHelper from "../../../../libs/context";
import  gridUtils from "../utils";

var operation= {
    name:"del",
    title:"删除",
    icon:"ios-trash",
    type:"warning",
    operationType:"common",
    handler:null,
    disabled:function (ctx) {
        return !(ctx.selectedItems && ctx.selectedItems.length === 1);
    },
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
//operation[contextHelper.getMvueToolkit().utils.dataPermField]=contextHelper.getMvueToolkit().utils.permValues.create;

function impl(context,$optInst){
    var id=gridUtils.getIdFromContext(context);
    if(!id){
        contextHelper.error({content:`当前数据id未设置`});
        return;
    }
    var metaEntity=context.metaEntity;
    var handler=gridUtils.buildDeleteHandler($optInst.operation,context.grid,metaEntity);

    contextHelper.confirm({
        title: '提示',
        content: '确定删除吗?',
        onOk: () => {
            //,cascade_delete:true
            handler({id:id}).then(function (re) {
                //如果是grid列表的操作，刷新列表
                context.grid&&context.grid.reload();
                //如果是表单的删除操作，执行表单的删除后回调
                context.form&&context.form.onDeleted();
            });
        }
    });
}


export default  operation





