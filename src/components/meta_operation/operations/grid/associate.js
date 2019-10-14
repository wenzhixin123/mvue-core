/**
 *  一对多关系列表，选择多的数据关联操作
 */

var operation= {
    name:"associate",
    title:"关联",
    icon:"ios-infinite",
    operationType:"common",
    btnType:"primary",
    security:["update"],
    entitySecurity:true,
    renderComponent:"m-grid-associate",
    show:function(context,opt){
        return context.grid&&context.grid.ifOneToManyGrid();
    }
};
export default  operation





