<template>
    <div class="widget-operation div-inline-block">
        <component :is="operationComponent" :operation="operation" :widget-context="extendedWidgetContext">
            <slot></slot>
        </component>
    </div>
</template>
<script>
//操作类型定义
var operationType={common:'common', toPage:'toPage', widget:'widget', popup:'popup',script:'script'};
//将不同的部件操作类型转成实际的操作
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
    computed:{
        operationComponent:function(){
            if(this.operation.onclick){
                this.operation.operationType=operationType.script;
            }
            return `${this.operation.operationType}Operation`;
        },
        extendedWidgetContext:function(){
            return _.extend(this.widgetContext,this.operation.params);
        }
    },
    data(){
        return {};
    },
    components:{
        commonOperation:require('./common_operation'),
        widgetOperation:require('./widget_operation'),
        toPageOperation:require('./to_page_operation'),
        popupOperation:require('./popup_operation'),
        scriptOperation:require('./script_operation'),
    }
}
</script>

