export default{
    props: {
        "defaultSort": {//默认排序设置{key:'',order:'desc'}
            type: Object
        },
        "columns": {
            type: Array,
            required: false,
        },
        "entityName": {//元数据实体名称，由外部传入
            type: String,
            required:true
        },
        queryOptions:{//leap的固定查询参数
            type:Object,
            required:false
        },
        handleOnTitleClick:{//点击标题列处理函数
            type:[Function,Object,String,Boolean],
            default:undefined,
            required:false
        },
        maxColumnsSize:{//默认生成列时，列表最多显示的列数
            type:Number,
            required:false
        },
        useRelativePath:{//CRUD时使用关系的相对路径
            type:Boolean,
            required:false,
            default:true
        }
    }
}
