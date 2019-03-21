import context from "./context";
//分批次顺序获取数据
async function queryByBatches(refGrid,ctx,maxLocalSize,_resource,_query){
    let pSize =ctx.currentPageSize;
    maxLocalSize=maxLocalSize||1000;
    let pages=Math.ceil(pSize/maxLocalSize);
    let pagesSize=[],batchPromises=[];
    for(let i=0;i<pages;++i){
        let __ctx=_.cloneDeep(ctx);
        __ctx.currentPage=i+1;
        __ctx.currentPageSize=maxLocalSize;
        if(_query){
            batchPromises.push(_query(__ctx,_resource));
        }else{
            batchPromises.push(context.getMvueComponents().leapQueryConvertor.exec(_resource,__ctx,(params)=>{
                refGrid.beforeQuery&&refGrid.beforeQuery(params);
            }));
        }
    }
    let listData={data:[],total:0};
    for(let j=0;j<batchPromises.length;++j){
        let {data,total}=await batchPromises[j];
        listData.data=listData.data.concat(data);
        listData.total=total;
    }
    return listData;
}
export default {
    exec:queryByBatches
}