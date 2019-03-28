/**
 *  列表的创建操作
 */
import contextHelper from "../../../../libs/context";
import  gridUtils from "../utils";

var operation= {
    name:"batchDelete",
    title:"删除",
    icon:"ios-trash",
    btnType:"warning",
    operationType:"common",
    handler:null,
    security:["delete"],
    entitySecurity:true,
    disabled:function (ctx) {
        return !(ctx.selectedItems && ctx.selectedItems.length > 0);
    },
    onclick:function(context,$optInst) {
        return impl(context,$optInst);
    }
};
//operation[contextHelper.getMvueToolkit().utils.dataPermField]=contextHelper.getMvueToolkit().utils.permValues.create;

function impl(context,$optInst){
    var metaEntity=context.metaEntity;
    //计算id字段
    var idField=null;
    if( !_.isEmpty(metaEntity)){
        idField=metaEntity.getIdField();
    }

    //检查当前用户对每一行数据是否有删除权限
    let opt={},unpermedItems=[],permedItems=[],unpermedInfo='';
    let _utils=contextHelper.getMvueToolkit().utils;
    opt[_utils.dataPermField]=_utils.permValues.del;
    var checkedRows=context.selectedItems;
    if(_.isEmpty(checkedRows)){
        contextHelper.error({content:`必须传入选中的所有行数据`});
        return;
    }
    _.each(checkedRows,function(item){
        let has=_utils.hasDataPerm(item,opt);
        if(!has){
            unpermedItems.push(item);
        }else{
            permedItems.push(item);
        }
    });
    if(!_.isEmpty(unpermedItems)){
        if(unpermedItems.length===checkedRows.length){
            contextHelper.warning({
                title: '提示',
                content:'您对选中的数据没有删除权限'
            });
            return;
        }else{
            unpermedInfo=`您选中了${checkedRows.length}条数据，有${unpermedItems.length}条没有删除权限，继续删除剩下的${checkedRows.length-unpermedItems.length}条吗`;
        }
    }
    var handler=gridUtils.buildDeleteHandler($optInst.operation,context.grid,metaEntity);
    contextHelper.confirm({
        title: '提示',
        content: unpermedInfo||'确定删除吗?',
        onOk: () => {
            _.each(permedItems,function(row){
                let id=row[idField.name];
                //,cascade_delete:true
                handler({id:id}).then(function (re) {
                    contextHelper.getMvueToolkit().utils.smartAction($optInst,"reloadChangedQueue",()=>{
                        context.grid&&context.grid.reload(false,{action:'delete',ids:[id]});
                    },1000);
                });
            });
        }
    });
}



export default  operation





