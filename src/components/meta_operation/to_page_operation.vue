<template>
<div @click="gotoPage">
    <slot>
        <Button type="primary" size="small" 
            :title="operation.title" >
            <Icon :type="operation.icon"></Icon>
            {{operation.title}}
        </Button>
    </slot>
</div>
</template>
<script>
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
                content:"pageId参数缺失"
            });
        }
        return {

        };
    },
    methods:{
        gotoPage(){
            if(!this.operation.pageId){
                return;
            }
            var _query=_.extend({},this.widgetContext.pageQuery);
            var pageId=this.operation.pageId;
            var _params=_.extend({pageId:pageId},this.widgetContext.pathParams);
            router.push({name:"defaultPageIndex",query:_query,params:_params});
        }
    }
}
</script>

