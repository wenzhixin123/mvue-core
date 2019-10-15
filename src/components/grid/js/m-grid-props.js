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
            //默认生成的路由path是否为相对路径：默认值true采用相对路径，如果当前m-grid的对应的路由路径为``/entities/aaa/list``，则创建页为``./create``等价于``/entities/aaa/create``，编辑页为``./recordId/edit``等价于``/entities/aaa/recordId/edit`` 
            type:Boolean,
            required:false,
            default:true
        }
    }
}
