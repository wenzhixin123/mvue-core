<template>
<div>
    <component 
        :widget-context="widgetContext" 
        :operation="operation" 
        :is="operation.widget"
        @on-close="close">
        <slot>
        </slot>
    </component>
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
        return {

        };
    },
    methods:{
        close(){//如果部件提供了on-close回调，在grid上的操作后要刷新grid
            if(this.widgetContext.grid){
                this.widgetContext.grid.reload();
            }
        }
    }
}
</script>

