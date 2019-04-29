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
        }else if(ctx.metaEntity&&ctx.metaEntity.rowSecurityEnabled){
            //如果未选中任何行，并且实体开启了行级权限，这时候必须选择行才可以进入批量编辑界面，
            // 否则批量编辑会出现无编辑权限的数据
            return true;
        }
        //未勾选，可以点击批量编辑，不禁用按钮
        return false;
    },
    security:["update"],
    entitySecurity:true,
    renderComponent:"m-grid-batch-editor"
};
export default  operation