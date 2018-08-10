<template>
<div @click.stop.prevent="execScript">
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
            mustStopRepeatedClick:false//阻止点击操作重复触发
        };
    },
    methods:{
        execScript(){
            if(this.mustStopRepeatedClick){
                return;
            }
            var _widgetCtx = Object.assign(this.widgetContext, this.operation);
            if(_.isFunction(this.operation.onclick)){
                this.mustStopRepeatedClick=true;
                this.operation.onclick(_widgetCtx,this);
            }else{
                this.mustStopRepeatedClick=true;
                var onclick=Function('"use strict";return ' + this.operation.onclick  )();
                onclick(_widgetCtx,this);
            }
            this.mustStopRepeatedClick=false;
            this.$emit("triggered","script");
        }
    }
}
</script>

