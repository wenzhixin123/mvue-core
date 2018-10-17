import context from '../../../../libs/context';
import queryMethods from '../user-select/query-methods';
export default{
    props:{
        treeExpandLevel:{//部门树默认展开到第几级
            type:Number,
            default:1
        },
        treeLeafKey:{//部门数据标志为叶子节点的字段属性
            type:String,
            default:''
        }
    },
    data(){
        return {
            queryMethods:queryMethods
        }
    }
}