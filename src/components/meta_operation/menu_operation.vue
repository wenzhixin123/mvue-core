<template>
    <div>
        <slot>
            <Button
                    @click.stop="changeWindowState"
                    type="primary"
                    size="small"
                    :title="operation.title"
            >
                <Icon :type="operation.icon"></Icon>
                {{operation.title}}
            </Button>
        </slot>

        <Card
                dis-hover
                v-if="show"
                style="position: absolute; top: 40px"
        >
            <meta-operation
                    @triggered="close"
                    class="opa_menu"
                    :operation="item"
                    :widget-context="widgetContext"
                    v-for="(item,index) in child_operations"
                    v-bind:key="index"
            >
            </meta-operation>
        </Card>
    </div>
</template>
<script>
  var Config = require('../../config/config.js')

  export default {

    props: {
      widgetContext: {
        //由使用操作的部件传入的部件上下文
        type: Object,
        required: true
      },
      operation: {
        //操作的定义，必传参数
        type: Object,
        required: true
      }
    },
    data () {
      return {
        mustStopRepeatedClick: false, //阻止点击操作重复触发
        implCode: '', //存入执行代码
        show: false,
        child_operations: null
      }
    },
    methods: {
      close () {
        this.show = false
      },
      changeWindowState () {
        this.show = !this.show
        this.execScript()
      },
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
            this.mustStopRepeatedClick = true
            this.operation.onclick(_widgetCtx, window.factoryApi)
          } else {
            this.mustStopRepeatedClick = true
            var onclick = Function('"use strict";return ' + this.operation.onclick)()
            onclick(_widgetCtx, window.factoryApi)
          }
          this.mustStopRepeatedClick = false
          this.$emit('triggered', 'menu')
        } else {
          if (this.mustStopRepeatedClick) {
            return
          }
          if (_t.implCode) {
            _t.cellExecScript()
          } else {
            //获取执行代码
            mvueCore.resource(`meta_operation/${_t.operation.operationId}`, null, {root: _.trimEnd(Config.getMetaserviceUrl(), '/')}).get({}).then(({data}) => {
              _t.implCode = data.implCode
              _t.cellExecScript()
            })
          }
        }
      },
      cellExecScript () {
        var _widgetCtx = Object.assign(this.widgetContext, {'buttonInfo': this.operation})
        OperationUtils.execution(this.operation, _widgetCtx, 'beforeExecCode', this).then((res) => {
          //所有跳转都带入dataId数据id,entity实体id
          if (_.isFunction(this.implCode)) {
            this.mustStopRepeatedClick = true
            this.implCode(_widgetCtx, window.factoryApi)
          } else {
            this.mustStopRepeatedClick = true
            var onclick = Function('"use strict";return ' + this.implCode)()
            onclick(_widgetCtx, window.factoryApi)
          }
          this.mustStopRepeatedClick = false
          this.$emit('triggered', 'menu')
          OperationUtils.execution(this.operation, _widgetCtx, 'afterExecCode', this)//执行后
        })
      }
    },
    mounted () {
      let operation = this.operation
      var _t = this //页面参
      mvueCore
        .resource(`mp_operation`, null, {
          root: _.trimEnd(Config.getApiBaseUrl(), '/')
        })
        .get({
          orderby: 'updatedAt desc',
          filters: 'parentId eq ' + operation.id,
          page: 1,
          page_size: 10,
          total: true
        })
        //parentId eq （按钮的id）
        .then(({data}) => {
          this.child_operations = data
        })
      // mvueCore.resource(`meta_operation/abc`, null, null);

      if (operation != null && !_.isEmpty(operation.id)) {
        console.log('OK')
        //this.$alert(Config.serverConfig)   hostServerUrl
        //   service.init(Config.serverConfig.configServerUrl); //初始化请求到的地址
        //   // filters: "parentId eq " + operation.id,
        //   let params = {
        //     orderby: "updatedAt desc",
        //     page: 1,
        //     page_size: 10,
        //     total: true
        //   };

        //   service.getMenuItems(params).then(res => {
        //     this.child_operations = res;
        //   }); //获取引擎地址
      } else {
        console.log('参数未传递')
        return
      }
    }
  }
</script>
<style scoped>
    #div_menu {
        width: 100%;
        height: 100%;
    }

    #div_window {
        padding: 10px;
    }

    .opa_menu {
        display: block;
    }
</style>


