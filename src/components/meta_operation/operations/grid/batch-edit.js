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
        if(!noItem){
            let oneHasDeletePerm=true;
            _.forEach(ctx.selectedItems,item => {
                oneHasDeletePerm = sc.hasRowPerm(item,opt.security);
                if(!oneHasDeletePerm){
                    return false;
                }
            });
            return !oneHasDeletePerm;
        }
        return noItem;
    },
    security:["edit"],
    entitySecurity:true,
    renderComponent:"m-grid-batch-editor"
};
export default  operation