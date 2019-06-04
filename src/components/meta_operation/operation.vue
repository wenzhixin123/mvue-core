<template>
    <div class="widget-operation div-inline-block"  >
        <component v-if="hasPermission"  @triggered="triggered" @successed="successed" :is="operationComponent" :operation="extendedOperation" :widget-context="extendedWidgetContext">
            <slot :operation="extendedOperation"></slot>
        </component>
        <slot v-else name="onDeny"></slot>
    </div>
</template>
<script>
import propParser from '../../services/tool/prop_parser';
import OperationUtils from './operations/utils';
import operations from "./operations/register";
import  operationManager from "../../libs/operation/operations";
import getParent from '../mixins/get-parent';
import context from '../../libs/context';
import sc from '../../libs/security/permission';
//操作类型定义
var operationType={common:'common', toPage:'toPage', widget:'widget', popup:'popup',script:'script',group:'group',selectEntity:'selectEntity'};
//将不同的部件操作类型转成实际的操作
export default {
    mixins:[getParent],
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
            if(!this.operation.operationType){
                return;
            }
            return `${this.operation.operationType}Operation`;
        },
        extendedOperation:function(){
            var oper=this.operation;
            if(this.operation.operationType==operationType.common){
                oper=operationManager.create(oper);
             }
            oper=OperationUtils.expandOperation(oper,this);
            return oper;
        },
        extendedWidgetContext:function(){
            var _this=this;
            var params={};
            _.forIn(this.operation.props,function(propValue,propKey){
                if(propValue.internal){//来自于context的属性，合并到widgetContext中
                    var parsedValue=propParser.parse(propValue,_this);
                    params[propKey]=parsedValue;
                }
            });
            return _.extend(this.widgetContext,params);
        },
        hasPermission:function(){//根据自定义操作权限表达式计算操作是否需要隐藏
            var operation=OperationUtils.expandOperation(this.operation,this);
            var optPermValue=operation.security;
            if(_.isEmpty(optPermValue)){
                return true;
            }
            var hasPermission=this.chkPermission(operation,this.widgetContext);
            return hasPermission;
        }
    },
    data(){
        return {};
    },
    methods:{
        triggered(optType){
            this.$emit("triggered",optType);
        },
        successed(optType){
            this.$emit("successed",optType);
        },
        chkPermission(opt,ctx){
            var hasPermission=false;
            var optNeedPerm=opt.security;
            if(_.isEmpty(optNeedPerm)){
                hasPermission=true;
                return hasPermission;
            }
            if(!_.isArray(optNeedPerm)){
                optNeedPerm=[optNeedPerm];
            }
            //hasPermission
            if(_.has(ctx,"hasPermission")){
                var reVal=ctx.hasPermission(opt,ctx);
                if(reVal!=null){
                    return reVal;
                }
            }
            let selectedItem=ctx.selectedItem;
            if(opt.rowSecurity===true &&
                selectedItem && selectedItem["__ops__"]){
                hasPermission=sc.hasRowPerm(selectedItem,optNeedPerm);
            }else{
                //功能级权限数据判断
                hasPermission=sc.hasPerm(optNeedPerm);
            }
            return hasPermission;
        }
    },
    components:{
        commonOperation:require('./common_operation'),
        widgetOperation:require('./widget_operation'),
        toPageOperation:require('./to_page_operation'),
        popupOperation:require('./popup_operation'),
        scriptOperation:require('./script_operation'),
        groupOperation:require('./group-operation'),
        selectEntityOperation:require('./select-entity-operation'),
    }
}
</script>


