import context from '../../../../libs/context';
import queryMethods from './query-methods';
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
    },
    methods:{
        buildUserDesc(userItem){
            return userItem.email||userItem.userName||userItem.loginId;
        },
        renderFormat(item){
            var titleField=this.getTitleField();
            return `${item[titleField]}-${this.buildUserDesc(item)}`;
        },
        orgValueKey:function(){
            return context.getConsts().org.idField;
        },
        orgLabelKey:function(){
            return context.getConsts().org.nameField;
        } 
    }
}