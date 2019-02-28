/**
 *  列表的导入操作
 */

var operation= {
    name:"batchEdit",
    title: "批量编辑",
    icon: "ios-create-outline",
    operationType:"common",
    btnType:"primary",
    security:["create"],
    entitySecurity:true,
    renderComponent:"m-grid-batch-editor"
};
export default  operation