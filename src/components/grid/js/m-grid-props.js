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
            type:[Function,Object,String],
            required:false
        },
        refField:{//多对一关系列表自动过滤的字段
            type:String,
            required:false
        },
        fromRelation:{//关联列表会提供关系配置，如{entityName:'organization',name:"users"}，多对多关系：{entityName:'organization',name:"users"}
            type:Object,
            required:false
        },
        maxColumnsSize:{//默认生成列时，列表最多显示的列数
            type:Number,
            required:false
        },
        useRelativePath:{//CRUD时使用关系的相对路径
            type:Boolean,
            required:false,
            default:false
        }
    }
}