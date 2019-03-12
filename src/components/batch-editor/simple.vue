<template>
    <div class="m-simple-batch-editor" :style="{width: editorWidth+'px'}">
        <div class="toolbar" v-if="beginImport">
            <!-- <Button type="primary" size="small" icon="ios-document-outline" @click="doImport">保存</Button> -->
            <div>总记录数{{items.length}}条,已导入{{items.length-total}}条;本次导入{{currentImported}}条,耗时{{ellapsedTime()}}毫秒</div>
        </div>
        <div class="header">
            <div class="header-item">错误信息</div>
            <div v-for="cm in columnMappings" :key="cm.index" v-text="cm.title" class="header-item"></div>
        </div>
        <div class="body">
            <div v-for="ci in currentItems" :key="ci.index" class="body-item">
                <div class="body-item-input">
                    <div class="error" v-text="ci.item[ci.item.length-1].e" :title="ci.item[ci.item.length-1].e"></div>
                </div>
                <template v-for="(p,idx) in ci.item">
                    <div :key="idx" class="body-item-input" v-if="idx<ci.item.length-1">
                        <input v-model="ci.item[idx]" type="text" class="control">
                    </div>
                </template>
            </div>
        </div>
        <div class="footer">
            <Page ref="pageRef"
                :total="total"
                :current.sync="currentPage"
                :page-size="pageSize"
                :page-size-opts="pageSizeOpts"
                @on-change="handleCurrentPageChange"
                @on-page-size-change="handlePageSizeChange"
                size="small"
                show-elevator show-sizer show-total></Page>
        </div>
    </div>
</template>
<script>
import importService from "../../services/tool/import-service";
export default {
    props:{
        importId:{
            type:String,
            required:true
        },
        entityName:{//当前批量编辑的实体名称
            type:String,
            required:true
        },
        columnMappings:{//每一列的映射关系[{index:0,title:'姓名',entityName:'user',fieldName:'name'}]
            type:Array,
            required:true
        },
        items:{
            type:Array,//[['lijing','架构部',{error}]]
            required:true
        },
        pageSize: {//每页条数
            type: Number,
            default: 50
        },
        pageSizeOpts: {
            type: Array,
            required: false,
            default: function () {
                return [50,100];
            }
        }
    },
    data(){
        return {
            innerItems:this.items,
            otherInnerItems:this.items,
            innerItemsSuccessFlag:{},
            currentPage:1,
            currentItems:[],//[{index:0,item:['lijing','架构部',{error}]}]
            eachBatchSize:10,
            total:0,
            beginImport:false,
            startTime:null,
            endTime:null,
            currentImported:0
        };
    },
    computed:{
        editorWidth(){
            return (this.columnMappings.length+1)*150;
        }
    },
    mounted(){
        this.doReload();
    },
    methods:{
        //按批次导入已修正的数据，一个批次出错后续不再导入
        async doImport(){
            if(this.currentItems.length==0){
                this.$Message.info('数据已全部导入成功，可重新导入其它数据');
                return;
            }
            this.startComputeEllapsedTime();
            let _otherInnerItems=this.otherInnerItems;
            let batches=Math.ceil(_otherInnerItems.length/this.eachBatchSize);
            this.currentImported=0;
            //每次导入要清空成功数据索引
            this.innerItemsSuccessFlag={};
            for(let i=0;i<batches;++i){
                var start=i*this.eachBatchSize;
                var end=start+this.eachBatchSize;
                if(end>_otherInnerItems.length){
                    end=_otherInnerItems.length;
                }
                let rows=_.cloneDeep(_otherInnerItems.slice(start,end));
                //去掉每个row的最后一列：错误信息列
                for(let j=0;j<rows.length;++j){
                    rows[j]=rows[j].slice(0,rows[j].length-1);
                }
                let _model={
                    id:this.importId,
                    columns:this.columnMappings,
                    rows:rows
                };
                this.beginImport=true;
                let success=await importService().executeImportRows2({entityName:this.entityName},_model).then(({data})=>{
                    //有失败的数据
                    if(data.failedRows>0){
                        let successIdx=[];
                        for(let k=0;k<rows.length;++k){
                            let realIndex=start+k;
                            let err=data.errors[k];
                            if(err){
                                //如果有错修改错误信息
                                let oldRow=_otherInnerItems[realIndex];
                                oldRow[oldRow.length-1].e=err.e;
                            }else{
                                //如果已导入，标记已成功导入
                                this.innerItemsSuccessFlag[realIndex]=true;
                                this.currentImported++;
                            }
                        }
                        return false;
                    }else{//本批次都成功
                        for(let kk=start;kk<end;++kk){
                            //如果已导入，标记已成功导入
                            this.innerItemsSuccessFlag[kk]=true;
                            this.currentImported++;
                        }
                        return true;
                    }
                },(err)=>{
                    console.error(err);
                    return false;
                });
                this.endComputeEllapsedTime();
                //每批次导入后根据成功或者错误情况，重新渲染列表
                this.doReload(_otherInnerItems);
                //如果本批次提交失败，终止整个提交流程
                if(!success){
                    break;
                }
            }
        },
        //分页页码切换
        handleCurrentPageChange(currentPage){
            this.doReload();
        },
        //每页条数切换
        handlePageSizeChange(pageSize){
            //切换条数后，页码变为第一页，如果当前页不是第一页会激发分页页码变化，所以这里阻止一下，不重复reload
            if(this.currentPage>1){
                return;
            }
            this.doReload();
        },
        buildCurrentItems(_otherInnerItems){
            var currentPageSize=this.pageSize;
            if(this.$refs.pageRef){
                currentPageSize=this.$refs.pageRef.currentPageSize;
            }
            var currentPage=this.currentPage||1;
            var start=(currentPage-1)*currentPageSize;
            var end=start+currentPageSize;

            let otherInnerItems=_.filter(_otherInnerItems||this.otherInnerItems,(item,index)=>{
                return !this.innerItemsSuccessFlag[index];
            })
            if(end>otherInnerItems.length){
                end=otherInnerItems.length;
            }
            let _citems=[];
            for(let i=start;i<end;++i){
                //这里如果数据本身不包含错误列，补充错误列
                if(otherInnerItems[i].length==this.columnMappings.length){
                    otherInnerItems[i].push({e:''});
                }
                _citems.push({
                    index:i,
                    item:otherInnerItems[i]
                });
            }
            if(_citems.length==0){
                this.$emit("on-all-succeessed");
            }
            //设置未完成导入的剩余总数
            this.otherInnerItems=otherInnerItems;
            this.total=otherInnerItems.length;
            return _citems;
        },
        doReload(_otherInnerItems){
            let _citems=this.buildCurrentItems(_otherInnerItems);
            this.currentItems= _citems;
        },
        startComputeEllapsedTime(){
            this.startTime=new Date();
        },
        endComputeEllapsedTime(){
            this.endTime=new Date();
        },
        ellapsedTime(){
            if(this.endTime&&this.startTime){
                if(this.endTime<this.startTime){
                    this.endTime=new Date();
                }
                return this.endTime-this.startTime;
            }
        }
    }
}
</script>
<style lang="less">
.m-simple-batch-editor{
    .toolbar{
        padding:5px 0px;
    }
    .header{
        display: table;
        background-color: #fafafa;
        width:100%;
        padding:5px 0px;
        border-bottom: 1px solid #e8e8e8;
        .header-item{
            display:table-cell;
            width:150px;
            text-align: center;
            font-weight: 700;
        }
    }
    .body{
        display: table;
        width:100%;
        .body-item{
            display: table-row;
            .body-item-input{
                width:150px;
                display: table-cell;
                vertical-align:middle;
                border-bottom: 1px solid #e8e8e8;
                .control{
                    width:100%;
                }
                .error{
                    word-break: keep-all;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width:120px;
                }
            }
        }
    }
    .footer{
        padding:5px 0px;
    }
}
</style>
