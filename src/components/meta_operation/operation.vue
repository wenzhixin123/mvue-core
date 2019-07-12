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
import entityResource from '../../libs/metadata/entity-resource';
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
    },
    data(){
        return {
            hasPermission:false
        };
    },
    mounted(){
        let operation=OperationUtils.expandOperation(this.operation,this);
        let optPermValue=operation.security;
        if(_.isEmpty(optPermValue)){
            this.hasPermission=true;
        }else{
            this.hasPermission=this.chkPermission(operation,this.widgetContext);
        }
    },
    methods:{
        triggered(optType){
            this.$emit("triggered",optType);
        },
        successed(optType){
            this.$emit("successed",optType);
        },
        chkPermission(opt,ctx){
            var hasPerm=false;
            var optNeedPerm=opt.security;
            if(_.isEmpty(optNeedPerm)){
                hasPerm=true;
                return hasPerm;
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
            let rowSecurity=opt.rowSecurity;
            if(!_.isPlainObject(rowSecurity)){
                rowSecurity={
                    enabled:opt.rowSecurity,
                    entityName:null,
                    rowId:null
                }
            }
            let selectedItem=null;
            if(rowSecurity.rowId && rowSecurity.entityName){
                selectedItem=entityResource.find(rowSecurity.entityName,rowSecurity.rowId);
            }else{
                selectedItem=ctx.selectedItem;
                if(!selectedItem || !selectedItem["__ops__"]){
                    selectedItem=ctx.parentItem;
                }
            }

            if(rowSecurity.enabled===true && selectedItem){
                if(!selectedItem.then){
                    selectedItem=Promise.resolve(selectedItem);
                }
                selectedItem.then(item=>{
                    if(item && item["__ops__"]){
                        this.hasPermission=sc.hasRowPerm(item,optNeedPerm);
                    }else{
                        this.hasPermission=sc.hasPerm(optNeedPerm);
                    }
                });
                return false;
            }else{
                //功能级权限数据判断
                hasPerm=sc.hasPerm(optNeedPerm);
            }
            return hasPerm;
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


