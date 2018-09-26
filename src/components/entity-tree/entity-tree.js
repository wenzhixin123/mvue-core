import  context from "../../libs/context";
export default {
    props:{
        treeExpandLevel:{//树默认展开到第几级
            type:Number,
            default:1
        },
        treeLeafField:{//部门数据标志为叶子节点的字段属性
            type:String,
            default:''
        },
        valueField:{
            type:String,
            default:'id'
        },
        labelField:{
            type:String,
            default:'title'
        },
        settings:{
            type:Object,
            default(){
                return {
                    treeExpandLevel:1,
                    dataResource:{
                        queryRoot:function () {},
                        queryByParent:function (parentId) {}
                    }
                }
            }
        }
    },
    created(){
        this.watchProp("treeExpandLevel");
        this.watchProp("treeLeafField");
        this.watchProp("valueField");
        this.watchProp("labelField");
    },
    data(){
        return {
            treeData:[],
            changedQueue:[]
        }
    },
    methods:{
        watchProp:function (prop) {
            if(!_.has(this.settings,prop)){
                this.$set(this.settings,prop,this[prop]);
            }
            this.$watch(prop,(newV,oldV)=>{
                this.$set(this.settings,prop,newV);
            });
        },
        toTreeData(items,level=0){
            var _data=[];
            _.forEach(items,item=>{
                var treeItem=Object.assign({},item,{
                    id:item[this.settings.valueField],
                    title:item[this.settings.labelField],
                    children: []
                });
                //如果指定展开到treeExpandLevel层，并且部门数据有children数据，则默认展开
                if(level<this.settings.treeExpandLevel&&item.children){
                    treeItem.expand=true;
                }
                //如果部门数据有children数据，则不用远程loading
                if(item.children){
                    let _level=level+1;
                    treeItem.children=this.toTreeData(item.children,_level);
                }else{
                    //如果部门数据有叶子标志并且非叶子节点，则需要远程loading
                    if(this.settings.treeLeafField&&(!item[this.settings.treeLeafField])){
                        treeItem.loading=false;
                    }
                    //没有任何叶子标志，默认需要远程loading
                    if(!this.settings.treeLeafField){
                        treeItem.loading=false;
                    }
                }
                _data.push(treeItem);
            });
            return _data;
        },
        buildRoot(){
            //加载根部门
            this.settings.dataResource.queryRoot().then(items=>{
                this.treeData=this.toTreeData(items);
            });
        },
        buildByKeyword(){
            context.getMvueToolkit().utils.smartSearch(this,()=>{
                if(!this.queryKeyword){
                    this.buildRoot();
                }else{
                    this.settings.dataResource.queryByKeyword(this.queryKeyword).then(items=>{
                        this.treeData=this.toTreeData(items);
                    });
                }
            },"changedQueue");
        },
        queryByParent (item, callback) {
            this.settings.dataResource.queryByParent(item.id).then(items=>{
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