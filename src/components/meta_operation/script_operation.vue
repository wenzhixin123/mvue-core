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
import OperationUtils from './js/operation_utils';
var Config=require("../../config/config.js");

export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        operation:{//操作的定义，必传参数
            type:Object,
            required:true,
        }
    },
    data(){
        return {
            mustStopRepeatedClick:false,//阻止点击操作重复触发
            implCode:""//存入执行代码
        };
    },
    methods:{
        execScript(){
            let _t = this;
            if(this.operation.onClick){
                this.operation.onclick = this.operation.onClick
            }
            if(this.operation.onclick) {
                if (this.mustStopRepeatedClick) {
                    return;
                }
                var _widgetCtx = Object.assign(this.widgetContext,{"buttonInfo":this.operation});
                if (_.isFunction(this.operation.onclick)) {
                    this.mustStopRepeatedClick = true;
                    this.operation.onclick(_widgetCtx,window.factoryApi);
                } else {
                    this.mustStopRepeatedClick = true;
                    var onclick = Function('"use strict";return ' + this.operation.onclick)();
                    onclick(_widgetCtx,window.factoryApi);
                }
                this.mustStopRepeatedClick = false;
                this.$emit("triggered", "script");
            }else {
                if (this.mustStopRepeatedClick) {
                    return;
                }
                if (_t.implCode) {
                    _t.cellExecScript();
                } else {
                    //获取执行代码
                    mvueCore.resource(`meta_operation/${_t.operation.operationId}`, null, {root: _.trimEnd(Config.getMetaserviceUrl(), '/')}).get({}).then(({data}) => {
                        _t.implCode = data.implCode;
                        _t.cellExecScript();
                    });
                }
            }
        },
        cellExecScript(){
            var _widgetCtx = Object.assign(this.widgetContext,{"buttonInfo":this.operation});
            OperationUtils.execution(this.operation,_widgetCtx,"beforeExecCode",this).then((res)=>{
                //所有跳转都带入dataId数据id,entity实体id
                if(_.isFunction(this.implCode)){
                    this.mustStopRepeatedClick=true;
                    this.implCode(_widgetCtx,window.factoryApi);
                }else{
                    this.mustStopRepeatedClick=true;
                    var onclick=Function('"use strict";return ' + this.implCode  )();
                    onclick(_widgetCtx,window.factoryApi);
                }
                this.mustStopRepeatedClick=false;
                this.$emit("triggered","script");
                OperationUtils.execution(this.operation,_widgetCtx,"afterExecCode",this)//执行后
            });
        }
    }
}
</script>

