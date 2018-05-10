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
import metagridOperation from '../grid/js/metagrid_operation';
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
            let commonOptName=this.operation.name;
            let commonOpt=metagridOperation.createOperation(commonOptName);
            if(commonOpt){
                //对于通用操作的属性，先复制到operation中，但如果operation中已经定义的，不需要复制，所以需要重写回来
                return _.extend(this.operation,commonOpt,this.operation);
            }
            return null;
        }
    },
    data(){
        return {};
    },
    methods:{
        buttonClick(){
            if(this.extendedOperation&&this.extendedOperation.onclick){
                this.extendedOperation.onclick(this.widgetContext,this);
            }
        }
    }
}
</script>

