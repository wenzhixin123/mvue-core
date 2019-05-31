<template>
  <div :class="{'bvue-select-group-append':showBtn&&append}">
    <slot name="btn" v-if="showBtn">
      <Button type="primary" :disabled="disabled" @click="toggleModal">
          <Icon :type="btnIcon"></Icon>
      </Button>
    </slot>
    <Modal class="bvue-select-modal" v-model="popupWidgetModal"
            :width="modalWidth"
            :title="modalTitle"
            :scrollable="true"
            transfer
            :mask-closable="false"
            >
        <div class="bvue-select-modal" :style="{height:modalHeight+'px',overflow:'auto'}">
            <ref-entity-select ref="selectRef" v-if="popupWidgetModal"
                :form-item="formItem"
                :multiple="multiple"
                :value="value" :queryOptions="queryOptions"
            ></ref-entity-select>
        </div>
        <div slot="footer">
            <Button type="default" @click="close">取消</Button>
            <Button type="primary" @click="confirmSelect">确定</Button>
        </div>
    </Modal>
  </div>
</template>
<script>
import selectModel from '../form/mixins/select-modal';
export default {
  mixins: [selectModel],
  props:{
    entityName:{//实体名称
      type:String,
      required:true
    },
    value:{//初始值
      type:[Array,Object]
    },
    multiple:{//是否支持多选
      type:Boolean,
      default:false
    },
    queryOptions: {//默认插叙条件
      type:Object
    },
    showBtn:{//是否显示按钮，显示后点击按钮可以弹出和关闭选择框，否则需要调用组件的toggleModal()控制弹出框隐藏和关闭
      type:Boolean,
      default:true
    },
    append:{//按钮是否添加append样式
      type:Boolean,
      default:false
    },
    disabled:{//按钮是否禁用
      type:Boolean,
      default:false
    },
    idField:{
      type:String
    },
    titleField:{
      type:String
    }
  },
  data(){
    let metaEntity=this.$metaBase.findMetaEntity(this.entityName);
    let defaultIdField=metaEntity.getIdField().name;
    let defaultTitleField=metaEntity.firstTitleField().name;
    return {
      formItem:{
        componentParams:{
          entityId:this.entityName,
          idField:this.idField||defaultIdField,
          titleField:this.titleField||defaultTitleField
        }
      }
    };
  },
  methods:{
    confirmSelect(){
      var selectedItem=this.$refs.selectRef.selectedItem;
      if(!selectedItem){
          this.$Modal.info({
              content:"请选择一行数据"
          });
          return;
      }
      this.selectedItem=selectedItem;
      this.$emit('on-select-change',selectedItem);
      this.close();
    }
  },
  components:{
    refEntitySelect:require('../form/control_tmpl/ref-entity-select')
  }
}
</script>
