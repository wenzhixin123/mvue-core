<template>
    <div>
        <!--直接跳转-->
        <div @click.stop.prevent="gotoPage">
            <slot>
                <Button type="primary" size="small"
                        :title="operation.title" >
                    <Icon :type="operation.icon"></Icon>
                    {{operation.title}}
                </Button>
            </slot>
        </div>
    </div>
</template>
<script>
    import OperationUtils from './js/operation_utils';
    export default {
        props:{
            widgetContext:{//由使用操作的部件传入的部件上下文
                type:Object,
                required:true
            },
            operation:{//操作的定义，必传参数
                type:Object,
                required:true
            }
        },
        data(){
            if(!this.operation.pageId){
                this.$Modal.error({
                    title:"错误",
                    content:"page参数缺失"
                });
            }
            return {
                pageParams:{}
            };
        },
        methods:{
            gotoPage(){
                let _t = this;
                var _widgetCtx = Object.assign(this.widgetContext, this.operation);
                OperationUtils.execution(this.operation,_widgetCtx,"beforeExecCode").then((res)=>{
                    //所有跳转都带入dataId数据id,entity实体id
                    var _query=_.extend({},_t.getIdFromContext(),_t.operation.queryParams);
                    var pageId=_t.operation.page.id;
                    var _params=_.extend({pageId:pageId,byOperation:true},_t.operation.pathParams);
                    router.push({name:"defaultPageIndex",query:_query,params:_params});
                    _t.$emit("triggered","toPage");
                    OperationUtils.execution(this.operation,_widgetCtx,"afterExecCode")//执行后
                });
            }
        }
    }
</script>

