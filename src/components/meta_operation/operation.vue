<template>
    <div class="widget-operation div-inline-block" v-if="showOperation">
        <component :is="operationComponent" :operation="operation" :widget-context="extendedWidgetContext">
            <slot></slot>
        </component>
    </div>
</template>
<script>
import propParser from 'services/page/prop_parser';
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
            var _this=this;
            var params={};
            _.each(this.operation.props,function(propValue,propKey){
                var parsedValue=propParser.parse(propValue,_this);
                params[propKey]=parsedValue;
            });
            return _.extend(this.widgetContext,params);
        },
        showOperation:function(){//根据自定义操作权限表达式计算操作是否需要隐藏
            var optPermValue=this.operation[Utils.dataPermField];
            optPermValue=_.trim(optPermValue);
            if(_.isNil(optPermValue)||optPermValue===''){
                return true;
            }
            var ctx={
                ctx: this.widgetContext,
                opt:this.operation
            }
            if(_.startsWith(optPermValue,'${')){
                var compiled = _.template(optPermValue);
                var hasPerm=compiled(ctx);
                if(hasPerm==="true"){
                    return true;
                }
            }
            return false;
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

