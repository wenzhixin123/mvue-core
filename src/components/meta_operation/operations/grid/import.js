/**
 *  列表的导入操作
 */
import sc from "../../../../libs/security/permission";
var operation= {
    name:"import",
    title:"导入",
    icon:"ios-upload-outline",
    operationType:"common",
    btnType:"primary",
    security:["create"],
    entitySecurity:true,
    renderComponent:"m-grid-import-data",
    show:function(context,opt){
        let hasPerm=sc.hasPerm(opt.security);
        return hasPerm;
    }
};
export default  operation





