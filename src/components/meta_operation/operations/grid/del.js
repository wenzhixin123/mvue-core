/**
 *  列表的创建操作
 */
import contextHelper from "../../../../libs/context";
import  gridUtils from "../utils";
import metabase from "../../../../libs/metadata/metabase";

var operation= {
    name:"del",
    title:"删除",
    icon:"ios-trash",
    btnType:"warning",
    operationType:"common",
    handler:null,
    disabled:function (ctx) {
        if(ctx.isGrid){
            return !(ctx.selectedItems && ctx.selectedItems.length === 1);
        }
        return false;
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
            handler({id:id},null,{onError:function (error) {
                    return onFailed(error,{id:id,metaEntity:metaEntity});
                }}).then(function (re) {
                //如果是grid列表的操作，刷新列表
                context.grid&&context.grid.reload();
                //如果是表单的删除操作，执行表单的删除后回调
                context.form&&context.form.onDeleted();
            });
        }
    });
}

function onFailed(error,context) {
    var response=error.response;
    if(!isRefViolation(response)){
        return false;
    }

    var sourceEntities=metabase.findSourceEntities(context.metaEntity.name);
    var entityNames=[];
    _.each(sourceEntities,metaEntity=>{
        entityNames.push(`【${metaEntity.title}】`);
    });
    var msg=`删除失败，该记录可能被以下对象引用：${entityNames.join('、')}`;
    contextHelper.error({
       title:"删除失败",
        content:msg
    });
    return true;
}

/**
 * 外键引用删除异常
 * @param response
 * @returns {boolean}
 */
function isRefViolation(response) {
    var match=false;
    if(response && response.status==400 && response.data && response.data.code=="db_ref_integrity_violation"){
        match=true;
    }
    return match;
}



export default  operation





