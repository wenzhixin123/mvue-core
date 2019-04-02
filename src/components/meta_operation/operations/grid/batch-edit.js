/**
 *  列表的导入操作
 */
import sc from "../../../../libs/security/permission";
var operation= {
    name:"batchEdit",
    title: "批量编辑",
    icon: "ios-create-outline",
    operationType:"common",
    btnType:"primary",
    disabled:function (ctx,opt) {
        let noItem= !(ctx.selectedItems && ctx.selectedItems.length > 0);
        //如果勾选了，需要判断权限
        if(!noItem){
            let oneHasEditPerm=true;
            _.forEach(ctx.selectedItems,item => {
                oneHasEditPerm = sc.hasRowPerm(item,opt.security);
                if(!oneHasEditPerm){
                    return false;
                }
            });
            return !oneHasEditPerm;
        }
        //未勾选，可以点击批量编辑，不禁用按钮
        return false;
    },
    security:["edit"],
    entitySecurity:true,
    renderComponent:"m-grid-batch-editor"
};
export default  operation