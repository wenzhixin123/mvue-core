<template>
<div>
    <!--有onclick的普通操作-->
    <div v-if="extendedOperation&&!extendedOperation.renderComponent" @click.stop.prevent="buttonClick">
        <slot>
            <Button type="primary" size="small" 
                :title="extendedOperation.title" >
                <Icon :type="extendedOperation.icon"></Icon>
                {{extendedOperation.title}}
            </Button>
        </slot>
    </div>
    <!--有renderComponent的普通操作-->
    <component v-if="extendedOperation&&extendedOperation.renderComponent" :widget-context="widgetContext" :operation="extendedOperation" :is="extendedOperation.renderComponent">
        <slot></slot>
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
    computed:{
        extendedOperation:function(){
            return this.operation;
            /*
            let commonOptName=this.operation.name;
            let commonOpt=commonOperation.createOperation(commonOptName);
            if(commonOpt){
                return Object.assign({},commonOpt,this.operation);
            }
            return null;*/
        }
    },
    data(){
        return {
            mustStopRepeatedClick:false//阻止点击操作重复触发
        };
    },
    methods:{
        buttonClick(){
            //TODO:导致列表菜单无法重复点击
            /*if(this.mustStopRepeatedClick){
                return;
            }*/
            if(this.extendedOperation&&this.extendedOperation.onclick){
                this.mustStopRepeatedClick=true;
                this.extendedOperation.onclick(this.widgetContext,this);
            }
            this.$emit("triggered",this.operation.name);
        }
    }
}
</script>

