<template>
<div @click="execScript">
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
        return {

        };
    },
    methods:{
        execScript(){
            if(_.isFunction(this.operation.onclick)){
                this.operation.onclick(this.widgetContext);
            }else{
                var onclick=Function('"use strict";return ' + this.operation.onclick  )();
                onclick(this.widgetContext);
            }
        }
    }
}
</script>

