export default{
    props: {
        queryUrl:{//外部指定的查询地址，必须是兼容leap查询协议的
            type:String,
            required:false
        },
        query:{//数据加载方法，可以由外边重写掉
            type:Function,
            required:false
        },
        "filters": {//高级查询的条件和列表头部的筛选条件设置
            type: Object
        },
        "toolbar": {
            type: Object,
            default() {
                return {};
            }
        },
        "operationsWithTitleColumn": {//是否操作列合并到标题列
            type: Boolean,
            required: false,
            default: false
        },
        "context": {
            type: Object,
            required: false
        },
        "pageSizeOpts": {
            type: Array,
            required: false,
            default: function () {
                return [10, 20, 50, 100];
            }
        },
        "pager": {
            type: Boolean,
            required: false,
            default: true
        },
        "pageSize": {//每页条数
            type: Number,
            default: 10
        },
        "pageSizeKey": {
            type: String,
            default: "page_size"
        },
        "pageKey": {
            type: String,
            default: "page"
        },
        "highlightRow": {//iview table属性，用来单选选中高亮
            type: Boolean,
            default: false
        },
        "showIndex": {//是否显示序号列
            type: Boolean,
            default: true
        },
        "showSelection": {//是否显示多选列
            type: Boolean,
            default: true
        },
        wrapperClass: {
            type: [String, Object, Array],
            default: "default-list-wrapper"
        },
        stripe: {
            type: Boolean,
            default: false
        },
        border: {
            type: Boolean,
            default: false
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        width: {
            type: [Number, String]
        },
        height: {
            type: [Number, String]
        },
        disabledHover: {
            type: Boolean,
            default: false
        },
        rowClassName: {
            type: Function,
            default() {
                return '';
            }
        },
        size: {
            type: String
        },
        noDataText: {
            type: String
        },
        noFilteredDataText: {
            type: String
        },
        id:{//用来唯一标志一个列表，用于存储列表的配置数据key，如配置列数据本地存储的key
            type:String
        },
        xmode:{//当前页面执行权限模式，此属性可改变
            type:String
        }
    }
}