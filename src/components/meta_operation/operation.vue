<template>
    <div class="widget-operation div-inline-block" v-if="showOperation">
        <component :is="operationComponent" :operation="extendedOperation" :widget-context="extendedWidgetContext">
            <slot :operation="extendedOperation"></slot>
        </component>
    </div>
</template>
<script>
import propParser from '../../services/tool/prop_parser';
//操作类型定义
var operationType={common:'common', toPage:'toPage', widget:'widget', popup:'popup',script:'script'};
var permParser={
    //来自表单的取消、开启编辑、编辑、删除权限
    "formCancel":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.cancel;
    },
    "formOpenEdit":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.openEdit;
    },
    "formEdit":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.edit;
    },
    "formDel":function(widgetContext){
        return widgetContext.form&&widgetContext.form.innerPermissions&&widgetContext.form.innerPermissions.del&&widgetContext.form.entityId;
    },
    //来自当前数据的查看、编辑、删除权限
    "selectedItemView":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.view);
    },
    "selectedItemEdit":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.edit);
    },
    "selectedItemDel":function(widgetContext){
        return widgetContext.selectedItem&&Utils.hasPerm(widgetContext.selectedItem[Utils.dataPermField],Utils.permValues.del);
    }
};
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
            if(this.operation.onclick&&!this.operation.operationType){
                this.operation.operationType=operationType.script;
            }
            return `${this.operation.operationType}Operation`;
        },
        extendedOperation:function(){
            var _this=this;
            var params={};
            _.each(this.operation.props,function(propValue,propKey){
                if(!propValue.internal){//非来自于context的属性，作为普通操作属性合并到operation中
                    var parsedValue=propParser.parse(propValue,_this);
                    params[propKey]=parsedValue;
                }
            });
            return _.extend(this.operation,params);
        },
        extendedWidgetContext:function(){
            var _this=this;
            var params={};
            _.each(this.operation.props,function(propValue,propKey){
                if(propValue.internal){//来自于context的属性，合并到widgetContext中
                    var parsedValue=propParser.parse(propValue,_this);
                    params[propKey]=parsedValue;
                }
            });
            return _.extend(this.widgetContext,params);
        },
        showOperation:function(){//根据自定义操作权限表达式计算操作是否需要隐藏
            var optPermValue=this.operation[Utils.operationDisplayField];
            if(!_.isPlainObject(optPermValue)){
                optPermValue=_.trim(optPermValue);
                if(_.isNil(optPermValue)||optPermValue===''){
                    return true;
                }
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
            }else if(_.isPlainObject(optPermValue)){
                var from=optPermValue.from;
                if(from){
                    var permParse=permParser[from];
                    if(permParse){
                        return !!permParse(this.widgetContext);
                    }
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

