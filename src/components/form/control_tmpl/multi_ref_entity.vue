<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItems)">
                <div class="view-title" v-text="formItem.componentParams.title"></div>
                <div v-text="selectedItems&&selectedItems[getTitleField()]"></div>
            </div>
        </template>
        <template v-else>
            <div v-if="formItem.componentParams.layout===controlTypeService.componentLayout.vertical" class="form-group"
                 :class="{'ivu-form-item-required':formItem.componentParams.required}">
                <label class="ivu-form-item-label" v-text="formItem.componentParams.title"></label>
                <div class="form-control form-control-w" :placeholder="formItem.componentParams.placeholder">
                    <div class="_input">
                        <Tag closable @on-close="onControlTargetItemDelete(index)" color="blue"
                             v-for="(item,index) in selectedItems">{{item.title}}
                        </Tag>
                        <!--<Input v-if="formItem.componentParams.supportInput"-->
                        <!--placeholder="请输入内容，按回车键确定"-->
                        <!--style="width: 300px; border-width: 0px"-->
                        <!--size="small"-->
                        <!--@on-enter="onInputEnter"-->
                        <!--@on-focus="onControlTargetItemInputFocus"-->
                        <!--v-model="idInput"-->
                        <!--&gt;</Input>-->
                        <input v-if="formItem.componentParams.supportInput"
                               v-model="idInput"
                               type="text" value="" :placeholder="placeholder"
                               @keyup.enter="onInputEnter()"
                               @focus="onControlTargetItemInputFocus()"
                               @blur="onControlTargetItemInputNotFocus()"
                               style="border-width: 0px; width: 300px; "/>
                        <!--<span class="_select_text" v-for="(item,index) in selectedItems">{{item.title}}-->
                        <!--<Icon type="android-cancel" class="_item_del" @click="del(index)"></Icon>-->
                        <!--</span>-->
                    </div>
                    <Icon size="20" type="ios-list-outline" @click="selectRemoteEntityModal=true"
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
                                <!--<Input v-if="formItem.componentParams.supportInput"-->
                                <!--placeholder="请输入内容，按回车键确定"-->
                                <!--style="width: 300px; border-width: 0px"-->
                                <!--size="small"-->
                                <!--@on-enter="onInputEnter"-->
                                <!--@on-focus="onControlTargetItemInputFocus"-->
                                <!--v-model="idInput"-->
                                <!--&gt;</Input>-->
                                <input v-if="formItem.componentParams.supportInput"
                                       v-model="idInput"
                                       type="text" value="" :placeholder="placeholder"
                                       @keyup.enter="onInputEnter()"
                                       @focus="onControlTargetItemInputFocus()"
                                       @blur="onControlTargetItemInputNotFocus()"
                                       style="border-width: 0px; width: 300px; "/>
                                <!--<span class="_select_text" v-for="(item,index) in selectedItems">{{item.title}}-->
                                <!--<Icon type="android-cancel" class="_item_del" @click="del(index)"></Icon>-->
                                <!--</span>-->
                            </div>
                            <Icon size="20" type="ios-list-outline" @click="selectRemoteEntityModal=true"
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
        <Modal class="select-remote-entity-modal"
               v-model="selectRemoteEntityModal"
               width="800"
               title="选择关联实体"
               :scrollable="true"
               @on-ok="doSelect">
            <div style="height:350px;overflow:scroll;">
                <Tabs :value="localTab">
                    <TabPane :label="refEntity.title" :name="refEntity.title" v-for="(refEntity,index) in refEntitys">
                        <meta-grid
                                :ref="`refEntity_ref_${index}`"
                                v-if="refEntity.entityResource"
                                :query-resource="refEntity.entityResource"
                                :query-options="{'orderby':refEntity.orderbyField?`${refEntity.orderbyField} ${refEntity.orderbyType||''}`:'',filters:refEntity.filter?refEntity.filter:''}"
                                :highlight-row="true"
                                :toolbar="showToolbar(refEntity)"
                                :columns="showColumns(refEntity)"
                                :showIndex="false"
                        >
                        </meta-grid>
                    </TabPane>
                </Tabs>
            </div>
            <div slot="footer">
                <button type="button" class="ivu-btn ivu-btn-text ivu-btn-large"
                        @click="selectRemoteEntityModal = false">
                    <span>取消</span></button>
                <button type="button" class="ivu-btn ivu-btn-primary ivu-btn-large" @click="doSelect"><span>确定</span>
                </button>
            </div>
        </Modal>
    </div>
</template>
<script>
  import mvueToolkit from 'mvue-toolkit'
  import controlBase from '../js/control_base'
  import metabase from '../../../libs/metadata/metabase'
  import metaservice from '../../../services/meta/metaservice'
  import utils from '../js/utils'

  export default {
    mixins: [controlBase],
    props: {
      value: {
        type: Array,
        default: function () {
          return []
        }
      }
    },
    data: function () {
      let _this = this
      if (this.formItem.componentParams && this.formItem.componentParams.refEntitys) {
        _.each(this.formItem.componentParams.refEntitys, (refEntity, index) => {
          if (!refEntity.entityResourceUrl) {
            metaservice.getEntity({id: refEntity.entityId}).then(function (res) {//获取实体信息和引擎地址
              let entityName = metabase.lowerUnderscore(res.data.name) //需要进行转换？
              let detailUrl = res.data.project.engine.externalUrl
              refEntity.entityResource = mvueToolkit.resource(`${detailUrl}/${entityName}`)
              refEntity.entityName = entityName
              _this.refEntitys[index] = refEntity
              _this.localTab = _this.refEntitys[0].title
              _this.setValue(_this.value)
            })
          }
        })
      }
      return {
        localTab: '',
        refEntitys: [],//存入实体数据的操作resource
        selectRemoteEntityModal: false,
        dataItems: [],//远程获取的数据项
        cachedDataItems: null,//默认提示的可选数据
        idInput: '',
        placeholder: '请输入内容，按回车键确定',
        selectedItems: [],//已经选择的项
        dataCommit: {},
        sIds: []
      }
    },
    computed: {},
    watch: {},
    mounted: function () {
    },
    methods: {
      setValue (val) {
        //设置已选值
        this.selectedItems = []
        if (this.refEntitys.filter((obj) => {
          return !obj.entityResource
        }).length) {
          return false
        }
        if (val) {
          _.each(val, (e, index) => {
            var data = utils.findValueFromJSONByDeep(e, this.model._data)
            if (data) {
              var _item = {id: data.id, title: data.title, entityId: data.entityId}
              this.addData(_item)
            } else {
              _.each(this.refEntitys, (refEntity) => {
                // console.log('HXB', 'refEntity==', JSON.stringify(refEntity))
                this.doSearch(refEntity, e, null, null, index)
              })
            }
          })
        }
      },
      doSearch: function (refEntity, value, keyword, callback, index) {
        var _this = this
        var params = {}
        if (!keyword) {
          params.limit = 5
          if (value) {
            params.filters = `${refEntity.idField} eq ${value}`
          }
        } else {
          params.filters = `${refEntity.titleField} like '%${keyword}%'`
        }
        if (refEntity.filter) {
          //设置了过滤条件
          if (params.filters) {
            params.filters += `and ${refEntity.filter}`
          } else {
            params.filters = `${refEntity.filter}`
          }
        }
        if (refEntity.orderbyField) {
          let orderbyType = refEntity.orderbyType || 'asc'
          if (refEntity.orderbyField) {
            params.orderby = `${refEntity.orderbyField} ${orderbyType}`
          }
        }
        if (refEntity.entityResource) {

          refEntity.entityResource.query(params)
            .then(function ({data}) {

              if (data && data[0]) {
                data = data[0]
                var idField = _this.getIdField(refEntity)
                var titleField = _this.getTitleField(refEntity)
                var sid = data[idField]
                var _item = {id: sid, title: data[titleField], entityId: refEntity.entityId}
                _this.addData(_item)
              } else {
                //找不到数据-直接填充值
                var _item = {
                  id: value,
                  title: value,
                  entityId: ''
                }
                _this.addData(_item)
              }
              _this.$forceUpdate()
              callback && callback()
            }, function (erro) {

              //找不到数据-直接填充值
              var _item = {
                id: value,
                title: value,
                entityId: ''
              }
              _this.addData(_item)
            })
        }
      },
      getIdField: function (formItem) {
        return formItem.idField
      },
      getTitleField: function (formItem) {
        return formItem.titleField
      },
      doSelect: function () {
        //点击选择实体数据
        var _select_data = [], _this = this
        _.each(this.refEntitys, (refEntity, index) => {
          //选中数据
          if (this.$refs[`refEntity_ref_${index}`] && this.$refs[`refEntity_ref_${index}`][0].checked) {
            var checkedData = this.$refs[`refEntity_ref_${index}`][0].checked
            _.each(checkedData, (data) => {
              data.refEntity = refEntity
            })
            _select_data = _select_data.concat(checkedData)
          }
        })
        if (_select_data.length) {
          _.each(_select_data, function (sitem) {
            var idField = _this.getIdField(sitem.refEntity)
            var titleField = _this.getTitleField(sitem.refEntity)
            var sid = sitem[idField]
            _this.addData({id: sid, title: sitem[titleField], entityId: sitem.refEntity.entityId})
          })
          this.emitData()
        }
        this.selectRemoteEntityModal = false
      },
      showToolbar (item) {
        return {
          quicksearch: {
            placeholder: '根据名称搜索',
            fields: [item.titleField]
          },
          batchBtns: [{}]
        }
      },
      showColumns (item) {
        return [
          {title: '名称', key: item.titleField, align: 'left'}
        ]
      },
      onInputEnter () {
        var item = {
          entityId: '',
          id: this.guid(),
          title: this.idInput
        }
        this.addData(item)
        this.emitData()
        this.idInput = ''
      },
      addData (data) {
        // var item = {
        //   entityId: '',
        //   id: id,
        //   title: this.idInput
        // }
        var _this = this, has = false
        for (var index in _this.selectedItems) {
          var item = _this.selectedItems[index]
          if (item.title == data.title) {
            has = true
            break
          }
        }
        if (!has) {
          _this.selectedItems.push(data)
          _this.dataCommit[data.id] = data
          _this.sIds.push(data.id)
        }
      },
      onControlTargetItemDelete (index) {
        //删除单条数据
        var delItem = this.selectedItems.splice(index, 1)
        this.sIds.splice(index, 1)
        delete this.dataCommit[delItem[0].id]
        this.emitData()
      },
      onControlTargetItemInputFocus () {
        this.placeholder = '请输入内容，按回车键确定'
      },
      onControlTargetItemInputNotFocus () {
        this.placeholder = ''
      },
      emitData () {
        this.$emit('exDataChanged', this.dataCommit, this.formItem.dataField)
        this.$emit('input', this.sIds)
      },
      S4 () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      },
      guid () {
        return (this.S4() + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + '-' + this.S4() + this.S4() + this.S4())
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


