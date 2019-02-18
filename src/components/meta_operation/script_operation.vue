<template>
    <div @click.stop.prevent="execScript">
        <slot>
            <Button type="primary" size="small"
                    :title="operation.title">
                <Icon :type="operation.icon"></Icon>
                <img v-if="!operation.hideImg" width="16" height="16" :src="mVueToolkit.config.getUploadUrl()+'?filePath='+operation.icon" @error="hideImg(operation)">
                {{operation.title}}
            </Button>
        </slot>

        <!--脚本内调用跳转页面,类型为弹窗-->
        <Modal class="popup-widget-con" v-model="modalInfo.show"
               :width="modalInfo.width"
               :title="modalInfo.title"
               :scrollable="true"
               :mask-closable="false"
        >
          <div class="modal-inner-widget" :style="{height:modalInfo.height+'px'}">
            <meta-widget-page :vue-modal="this" :widget-params="modalInfo.pageParams"></meta-widget-page>
          </div>
          <div slot="footer"></div>
        </Modal>
    </div>
</template>
<script>
  import OperationUtils from './js/operation_utils'
  import mVueToolkit from "mvue-toolkit";
  var Config = require('../../config/config.js')

  export default {
    props: {
      widgetContext: {//由使用操作的部件传入的部件上下文
        type: Object,
        required: true
      },
      operation: {//操作的定义，必传参数
        type: Object,
        required: true
      }
    },
    data () {
      let _this = this;
      return {
        mustStopRepeatedClick: false,//阻止点击操作重复触发
        mVueToolkit:mVueToolkit,
        //弹窗信息
        modalInfo:{
          width:500,
          height:340,
          title:_this.operation.title||"",
          show:false,
          pageParams:{}
        }
      }
    },
    methods: {
      execScript () {
        let _t = this
        if (this.operation.onClick) {
          this.operation.onclick = this.operation.onClick
        }
        if (this.operation.onclick) {
          if (this.mustStopRepeatedClick) {
            return
          }
          var _widgetCtx = Object.assign(this.widgetContext, {'buttonInfo': this.operation})
          if (_.isFunction(this.operation.onclick)) {
            this.mustStopRepeatedClick = true;
            this.operation.onclick(_widgetCtx, window.factoryApp)
          } else {
            this.mustStopRepeatedClick = true;
            _t.cellExecScript()
          }
          this.mustStopRepeatedClick = false;
          this.$emit('triggered', 'script')
        } else {
          if (this.mustStopRepeatedClick) {
            return
          }
          if (this.operation.onClick) {
            _t.cellExecScript()
          } else {
            //获取执行代码
            mvueCore.resource(`meta_operation/${_t.operation.operationId}`, null, {root: _.trimEnd(Config.getMetaserviceUrl(), '/')}).get({}).then(({data}) => {
              _t.operation.onClick=data.implCode;
              _t.cellExecScript()
            })
          }
        }
      },
      cellExecScript () {
        var _widgetCtx = Object.assign(this.widgetContext, {'buttonInfo': this.operation}),_this = this;
        OperationUtils.execution(this.operation, _widgetCtx, 'beforeExecCode', this).then((res) => {
          OperationUtils.setUrlParam(this.operation,this);//按钮输入参数处理
          //所有跳转都带入dataId数据id,entity实体id
          var fun = _this.operation.onClick;
          try{
            if (_.isFunction(fun)) {
              this.mustStopRepeatedClick = true
              fun(_widgetCtx, window.factoryApp);
            } else if(fun){
              this.mustStopRepeatedClick = true
              var onclick = Function('"use strict";return ' + fun)()
              onclick(_widgetCtx, window.factoryApp);
            }
          }catch(e){
            this.$Modal.error({
              title:"错误",
              content:`脚本语法有误:${e}`
            });
          }
          this.mustStopRepeatedClick = false
          this.$emit('triggered', 'script')
          OperationUtils.execution(this.operation, _widgetCtx, 'afterExecCode', this)//执行后
        })
      },
      hideImg(operation){
        //隐藏图片
        operation.hideImg=true;
        this.$forceUpdate();
      },
      close(){//关闭对话框
        this.modalInfo.pageParams = {pageId :""};
        this.modalInfo.show=false;
      }
    }
  }
</script>

