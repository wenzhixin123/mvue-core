import context from '../../../../libs/context';
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        },
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
        disableExpand(item){
            item.expand=false;
            item.loading=false;
            delete item.expand;
            delete item.loading;
            if(item.hasOwnProperty('children')){
                delete item.children;
            }
        },
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
                    //如果到达限制的层级，不再展开
                    if(this.selectLevel&&this.selectLevel<=item._level){
                        this.disableExpand(treeItem);
                    }else{
                        let _level=level+1;
                        treeItem.children=this.toTreeData(item.children,_level);
                        treeItem.children.forEach(ele => {
                            ele._level=ele._level||item._level+1;
                        });
                    }
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
                        this.disableExpand(treeItem);
                    }
                }
                if(this.selectLevel&&this.selectLevel<=treeItem._level){
                    this.disableExpand(treeItem);
                }
                _data.push(treeItem);
            });
            return _data;
        },
        buildRootData(){
            //加载根部门
            this.queryMethods.queryRootEntity().then(items=>{
                items.forEach(item => {
                    item._level=1;
                });
                this.entityTreeData=this.toTreeData(items);
            });
        },
        buildRootDataByKeyword(){
            context.getMvueToolkit().utils.smartSearch(this,()=>{
                if(!this.queryKeyword){
                    this.buildRootData();
                }else{
                    this.queryMethods.queryEntityByKeyword(this.queryKeyword).then(items=>{
                        items.forEach(item => {
                            if(!item[this.formItem.dataField]){
                                item._level=1;
                            }
                        });
                        this.entityTreeData=this.toTreeData(items);
                    });
                }
            },"changedQueue");
        },
        queryEntityByParent (item, callback) {
            //如果限制了选择层级，不可展开
            if(this.selectLevel&&this.selectLevel<=item._level){
                this.disableExpand(item);
                return;
            }
            this.queryMethods.queryEntityByParent(item.id).then(items=>{
                //如果无子部门，则去掉可展开图标，变为叶子节点
                if(items.length==0){
                    this.disableExpand(item);
                    return;
                }
                items.forEach(_item => {
                    _item._level=item._level+1;
                });
                var _data=this.toTreeData(items);
                callback(_data);
            });
        }
    }
}