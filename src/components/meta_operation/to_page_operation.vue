<template>
<div @click.stop="gotoPage">
    <slot>
        <Button :type="operation.btnType||'primary'" size="small" 
            :title="operation.title" >
            <m-icon :type="operation.icon"></m-icon>
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
        if(!this.operation.page){
            this.$Modal.error({
                title:"错误",
                content:"page参数缺失"
            });
        }
        return {

        };
    },
    methods:{
        gotoPage(){
            if(!this.operation.page){
                return;
            }
            var _query=_.extend({},this.operation.queryParams);
            var pageId=this.operation.page.id;
            var _params=_.extend({pageId:pageId},this.operation.pathParams);
            router.push({name:"defaultPageIndex",query:_query,params:_params});
            this.$emit("triggered","toPage");
        }
    }
}
</script>

