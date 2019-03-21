import context from '../../../../libs/context';
export default {
    props:{
        treeExpandLevel:{//树默认展开到第几级
            type:Number,
            default:1
        },
        treeLeafKey:{//数据标志为叶子节点的字段属性
            type:String,
            default:''
        }
    },
    data(){
        return {
            entityTreeData:[],
            changedQueue:[]
        }
    },
    methods:{
        toTreeData(items,level=0){
            var _data=[];
            _.each(items,item=>{
                var treeItem=Object.assign({},item,{
                    id:item[this.valueKey],
                    title:item[this.labelKey],
                    children: []
                });
                //如果指定展开到treeExpandLevel层，并且部门数据有children数据，则默认展开
                if(level<this.treeExpandLevel&&item.children){
                    treeItem.expand=true;
                }
                //如果部门数据有children数据，则不用远程loading
                if(item.children){
                    let _level=level+1;
                    treeItem.children=this.toTreeData(item.children,_level);
                }else{
                    //如果部门数据有叶子标志并且非叶子节点，则需要远程loading
                    if(this.treeLeafKey&&(!item[this.treeLeafKey])){
                        treeItem.loading=false;
                    }
                    //没有任何叶子标志，默认需要远程loading
                    if(!this.treeLeafKey){
                        treeItem.loading=false;
                    }
                    //如果初始值等于当前节点id，停止加载此节点下的所有数据
                    if(this.recordId&&item[this.valueKey]==this.recordId){
                        treeItem.disabled=true;
                        delete treeItem.expand;
                        delete treeItem.loading;
                        delete treeItem.children;
                    }
                }
                _data.push(treeItem);
            });
            return _data;
        },
        buildRootData(){
            //加载根部门
            this.queryMethods.queryRootEntity().then(items=>{
                this.entityTreeData=this.toTreeData(items);
            });
        },
        buildRootDataByKeyword(){
            context.getMvueToolkit().utils.smartSearch(this,()=>{
                if(!this.queryKeyword){
                    this.buildRootData();
                }else{
                    this.queryMethods.queryEntityByKeyword(this.queryKeyword).then(items=>{
                        this.entityTreeData=this.toTreeData(items);
                    });
                }
            },"changedQueue");
        },
        queryEntityByParent (item, callback) {
            this.queryMethods.queryEntityByParent(item.id).then(items=>{
                //如果无子部门，则去掉可展开图标，变为叶子节点
                if(items.length==0){
                    item.expand=false;
                    item.loading=false;
                    delete item.loading;
                    return;
                }
                var _data=this.toTreeData(items);
                callback(_data);
            });
        }
    }
}