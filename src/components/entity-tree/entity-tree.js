import  context from "../../libs/context";
import topEntityService from "../../services/store/top-entity";
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
        dataResource:{//必须提供这三个方法queryRoot queryByKeyword queryByParent
            type:Object,
            required:true,
            validator(value){
                return value&&value.queryRoot&&value.queryByKeyword&&value.queryByParent;
            }
        },
        maxLevel:{  //树最大展开级数
            type:Number,
            default:0
        },
        mustSelect:{
            type:Boolean,
            default:false
        },
        showCheckbox:{
            type:Boolean,
            default:false
        },
        loadDataWhenMount:{
            type:Boolean,
            default:true
        },
        entityName:{
            type:String
        }
    },
    data(){
        this.validateProps();
        return {
            treeData:[],
            changedQueue:[]
        }
    },
    methods:{
        validateProps(){
            var msg="";
            if(!_.isFunction(this.dataResource.queryRoot)){
                msg=`dataResource.queryRoot方法缺失`;
            }
            if(!_.isFunction(this.dataResource.queryByKeyword)){
                msg=`dataResource.queryByKeyword方法缺失`;
            }
            if(!_.isFunction(this.dataResource.queryByParent)){
                msg=`dataResource.queryByParent方法缺失`;
            }
            if(msg){
                this.$Modal.error({
                    title:"属性错误",
                    content:msg
                })
            }
        },
        toTreeData(items,level){
            var _data=[];
            var toBeSelected=null;
            _.forEach(items,(item,index)=>{
                var treeItem=_.assign({},item,{
                    id:item[this.valueField],
                    title:item[this.labelField],
                    children: [],
                    _level:level
                });
                //如果指定展开到treeExpandLevel层，并且部门数据有children数据，则默认展开
                if(level<=this.treeExpandLevel&&item.children){
                    treeItem.expand=true;
                }
                //如果部门数据有children数据，则不用远程loading
                if(item.children && item.children.length>0){
                    let _level=level+1;
                    treeItem.children=this.toTreeData(item.children,_level);
                }else{
                    //如果部门数据有叶子标志并且非叶子节点，则需要远程loading
                    if(this.treeLeafField&&(!item[this.treeLeafField])){
                        treeItem.loading=false;
                    }
                    //没有任何叶子标志，默认需要远程loading
                    if(!this.treeLeafField){
                        treeItem.loading=false;
                    }
                }
                if(this.maxLevel>0 && this.maxLevel<=level){
                    delete treeItem.loading;
                }
                if(this.mustSelect && level==1){
                    if(index==0){
                        toBeSelected=treeItem;
                    }
                    if(this.entityName){
                        var  topEntity=topEntityService.getHistory(this.entityName);
                        if(topEntity && topEntity.value==treeItem.id){
                            toBeSelected=treeItem;
                        }
                    }
                }
                _data.push(treeItem);
            });
            if(toBeSelected){
                toBeSelected.selected=true;
                if(this.showCheckbox){
                    toBeSelected.checked=true;
                }
                this.$emit("on-select-change",[toBeSelected]);
            }
            return _data;
        },
        buildRoot(){
            //加载根部门
            this.dataResource.queryRoot().then(items=>{
                this.treeData=this.toTreeData(items,1);
            });
        },
        buildByKeyword(){
            context.getMvueToolkit().utils.smartSearch(this,()=>{
                if(!this.queryKeyword){
                    this.buildRoot();
                }else{
                    this.dataResource.queryByKeyword(this.queryKeyword).then(items=>{
                        this.treeData=this.toTreeData(items);
                    });
                }
            },"changedQueue");
        },
        queryByParent (item, callback) {
            this.dataResource.queryByParent(item.id).then(items=>{
                //如果无子部门，则去掉可展开图标，变为叶子节点
                if(items.length==0){
                    item.expand=false;
                    item.loading=false;
                    delete item.loading;
                    return;
                }
                var _data=this.toTreeData(items,item["_level"]+1);
                callback(_data);
            });
        }
    }
}
