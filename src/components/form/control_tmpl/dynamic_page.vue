<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItems)">
                <!--                <div>selectedItems == {{selectedItems}}</div>-->

                <div class="view-title" v-text="formItem.componentParams.title"></div>

                <div v-text="selectedItems&&selectedItems[getTitleField()]"></div>
            </div>
        </template>
        <template v-else>
            <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group"
                 :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
                <div class="form-control form-control-w">
                    <div class="_input">
                        <div v-if="selectedItems && selectedItems.length>0">
                            <Tag closable @on-close="onControlTargetItemDelete(index)"
                                 color="blue"
                                 v-for="(item,index) in selectedItems">
                                {{item.title}}
                            </Tag>
                        </div>
                        <div v-else>{{formItem.componentParams.placeholder}}</div>
                    </div>
                    <Icon size="20" type="ios-list-outline" @click="onDataSelectWindowBtnClicked"
                          style="margin-top: 4px"></Icon>
                </div>
                <span class="colorRed"
                      v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                <p class="colorGrey" v-show="formItem.componentParams.description"
                   v-text="formItem.componentParams.description"></p>
            </div>
            <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.horizontal"
                 class="form-horizontal">
                <div class="form-group" :class="{'ivu-form-item-required':formItem.componentParams.required}">
                    <label v-text="formItem.componentParams.title" class="ivu-form-item-label control-label col-md-2"
                           :style="{width:labelWidth}"></label>
                    <div class="col-md-10" :style="{width:controlWidth}">
                        <div class="form-control form-control-w" :placeholder="formItem.componentParams.placeholder">
                            <div class="_input">
                                <Tag closable @on-close="onControlTargetItemDelete(index)" color="blue"
                                     v-for="(item,index) in selectedItems">{{item.title}}
                                </Tag>
                                <input v-if="formItem.componentParams.supportInput"
                                       v-model="idInput"
                                       type="text" value="" :placeholder="placeholder"
                                       @keyup.enter="onInputEnter()"
                                       @focus="onControlTargetItemInputFocus()"
                                       @blur="onControlTargetItemInputNotFocus()"
                                       style="border-width: 0px; width: 300px; "/>
                            </div>
                            <Icon size="20" type="ios-list-outline" @click="onDataSelectWindowBtnClicked"
                                  style="margin-top: 4px"></Icon>
                        </div>
                        <span class="colorRed"
                              v-show="validator&&validator.errorBag&&validator.errorBag.has(formItem.dataField)">{{ validator&&validator.errorBag&&validator.errorBag.first(formItem.dataField) }}</span>
                        <p class="colorGrey" v-show="formItem.componentParams.description"
                           v-text="formItem.componentParams.description"></p>
                    </div>
                </div>
            </div>
        </template>


        <Modal
                v-model="showWindow"
                :title="windowTitle"
                @on-ok="onOK"
                @on-cancel="onCancel"
                scrollable
                width="80">
            <meta-widget-page
                    v-if="page && page.id"
                    :widget-params='{pageId:page.id}'
                    ref="dynamicPage"
                    :query="getQuery()">
            </meta-widget-page>
        </Modal>
    </div>
</template>
<script>
  import controlBase from '../js/control_base'
  import networkUtil from '../js/network_util'
  import dynamicUtil from '../js/dynamic_page_util'
  import metabase from '../../../libs/metadata/metabase'

  export default {
    mixins: [controlBase],
    props: {
      value: {
        type: String,
        default: null
      },
      operationCode: {
        type: String,
        default: 'choose'
      }
    },
    data: function () {
      var proId = this.$route.params.projectId
      var entityId = this.formItem.componentParams.entityId
      return {
        // 选中的数据
        selectedItems: [
          // {title: 'aaaaa'},
          // {title: 'bbbbbbb'},
          // {title: 'ccccc'},
          // {title: 'ddddddddd'},
          // {title: 'e'},
          // {title: 'ffffffffffffff'},
          // {title: 'ggggggggg'}
        ],
        projectId: proId,
        entityId: entityId,
        page: null,
        showWindow: false,
        entity: {}
      }
    },
    computed: {
      dataItemsMap: function () {
        var idField = this.getIdField()
        return _.keyBy(this.dataItems, idField)
      },
      windowTitle () {
        return (this.page && this.page.title) ? this.page.title : ''
      }
    },
    watch: {
      value: function (newV, oldV) {
        if (newV) {
          this.selectedItem = this.dataItemsMap[newV] || null
        } else {
          this.selectedItem = null
        }
      },
      dataItems: function () {
        if (this.value) {
          this.selectedItem = this.dataItemsMap[this.value] || null
        }
      },
      entityId: {
        immediate: true,
        handler: function () {
          var _this = this
          if (_this.entityId) {
            // metabase.findMetaEntity()
            mvueCore.metaService.getEntity({id: _this.entityId}).then(function (res) {
              _this.entity = res
              var baseUrl = res.data.project.engine.externalUrl
              // networkUtil.getListData(
              //   baseUrl,
              //   _this.entity.data.name,
              //   null,
              //   function (res) {
              //     debugger
              //   },
              //   function (err) {
              //     debugger
              //   })
            })
          }
        }
      }
    },
    mounted: function () {
    },
    methods: {
      getWidgetContext () {
        var _this = this
        var widgetContext = {
          formItem: _this.formItem
        }
      },
      onControlTargetItemDelete (index) {
        this.selectedItems.splice(index, 1)
        this.exchangeDataAndEmit()
      },
      exchangeDataAndEmit () {
        var data = {}
        var ids = []
        for (var i in this.selectedItems) {
          var id = this.selectedItems[i]
          data[id.id] = {
            id: id.id,
            title: id.title,
            entityId: id.entityId
          }
          ids.push(id.id)
        }
        // this.model[this.formItem.dataField] = ids
        this.$emit('exDataChanged', data, this.formItem.dataField)

        // this.$emit('exDataChanged', this.dataCommit, this.formItem.dataField)
        this.$emit('input', ids)
      },
      getTitleField: function (formItem) {
        return formItem.titleField
      },
      onDataSelectWindowBtnClicked () {
        var _this = this
        networkUtil.getOperations(
          _this.projectId,
          _this.entityId,
          function (res) {
            if (!_this.operationCode) {
              return
            }
            for (var index in res) {
              var item = res[index]
              if (item.code == _this.operationCode) {
                _this.operation = item
                networkUtil.getPages4Operation(
                  _this.projectId,
                  _this.operation.id,
                  function (res) {
                    _this.page = res[0]
                    setTimeout(() => {
                      _this.showWindow = true
                    }, 100)
                  },
                  function (err) {
                    alert(JSON.stringify(err))
                  })
                break
              }
            }
          },
          function (error) {
          })
      },
      onOK () {
        var ids = dynamicUtil.findIds(this.$refs)
        this.selectedItems = ids
        this.exchangeDataAndEmit()
        this.showWindow = false
      },
      onCancel () {
        this.showWindow = false
      },
      getQuery () {
        var views = _.cloneDeep(this.formItem.componentParams.views)
        var query = {
          titleField: this.formItem.componentParams.titleField,
          metaEntityId: this.formItem.componentParams.entityId,
          parentField: this.formItem.componentParams.parentField,
          views: views,
          needCheckbox: true
        }
        // commonOperations: []
        return query
      }
    }
  }
</script>
<style lang="scss" scoped>
    .form-control-w {
        display: flex;
        min-height: 33px;
        height: auto;

        ._input {
            flex: 1;
        }

        ._select_text {
            display: inline-block;
            padding: 2px 5px;
            font-size: 12px;
            color: #fff;
            background-color: #2d8cf0;
            border-radius: 5px;
            margin-right: 10px;
        }

        ._item_del {
            margin-left: 5px;
        }
    }

</style>


