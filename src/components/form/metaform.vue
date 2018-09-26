<template>
    <Form v-if="preprocessed" :ref="'formRef'" :model="entity"
          :rules="innerRules" :inline="inline" :label-position="labelPosition" :label-width="labelWidth"
          :show-message="showMessage" :autocomplete="autocomplete">
        <slot>
            <meta-layout :settings="layout" :itemProcessor="layoutProcessor"></meta-layout>
        </slot>
        <FormItem v-if="hasButtons() || $slots.toolbar" class="form-toolbar"
                v-transfer-dom="toolbarTransferDomId" :data-transfer="transfer">
            <slot name="toolbar" >
                <template v-if="isView">
                    <meta-operation v-for="btn in innerToolbar.viewBtns" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button slot-scope="{operation}" :type="operation.btnType || 'primary'"  :title="operation.title">
                            <Icon :type="operation.icon" v-if="operation.icon"></Icon>
                            {{operation.title}}
                        </Button>
                    </meta-operation>
                </template>
                <template v-if="!isView">
                    <meta-operation v-for="btn in innerToolbar.editBtns" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button slot-scope="{operation}" :type="operation.btnType || 'primary'"  :title="operation.title">
                            <Icon :type="operation.icon" v-if="operation.icon"></Icon>
                            {{operation.title}}
                        </Button>
                    </meta-operation>
                </template>
            </slot>
        </FormItem>
    </Form>
</template>
<script>
    import metaformUtils from './js/metaform_utils';
    import controlTypeService from './js/control_type_service';
    import initByMetadata from './init-by-metadata';
    import formBase from './form-base';
    export default {
        mixins:[formBase],
        props:{
            entityName:{//必填参数，表示元数据实体的名称）
                type:String,
                required:true
            },
            layout:{
              type:Array,
                default:function(){
                    return [];
                }
            },
        },
        data:function(){
            var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            var dataResource=metaEntity.dataResource();
            //构造实体数据操作的基本数据模型，会包含需要提交到后台的所有字段：会过滤掉主键、创建时间等维护字段
            //这里提前初始化entity数据，保证字段的存在性，对于双向绑定和表单验证是必须的
            var entity=metaEntity.getDefaultModel();
            if(this.layout.length==0){
                _.forEach(metaEntity.getDefaultFormFields(),(metaFieldName)=>{
                    this.layout.length.push({
                        ctype:"meta-field",
                        name:metaFieldName,
                        context:this.fieldContext(metaFieldName)
                    });
                });
            }
            return {
                metaEntity:metaEntity,
                dataResource:dataResource,
                entity:entity
            };
        },
        mounted:function () {
            //创建模式，继续初始化，因为初始模型数据已经存在了
            if(this.isCreate){
                //如果url参数是实体的字段则填充相应的模型数据
                initByMetadata.initModelByQueryParams(this,this.entity);
                //根据关系填充模型关系字段数据：只考虑多对一关系
                initByMetadata.initModelByRelation(this,this.entity);
                this.initOthers();
            }else{//编辑或查看模式，需要从后端获取实体记录数据覆盖初始的模型数据，之后再继续初始化
                this.reinitEntityModel();
            }
        },
        methods:{
            initOthers(){
                //根据实体字段信息初始化表单默认验证规则
                this.initValidateRulesByMetaEntity();
                this.$store.commit("core/setEntity",{entityName:this.entityName,entity:this.entity});
                //预处理完毕，表单可以渲染了
                this.preprocessed=true;
                //调用外部传入的初始化回调函数
                if(this.onInited){
                    this.onInited(this);
                }
            },
            //根据数据id重新初始化entity模型数据
            reinitEntityModel(){
                return this.dataResource.get({id: this.entityId}).then(({data})=> {
                    //根据实体记录数据初始化操作权限
                    this.initPerm(data);
                    _.forIn(this.entity, (value, key) => {
                        this.entity[key] = data[key];
                    });
                    this.initOthers();
                });
            },
            //根据实体字段信息初始化表单默认验证规则
            initValidateRulesByMetaEntity:function () {
                var _this=this;
                _.forEach(_this.metaEntity.getDefaultFormFields(),function (fieldName) {
                    var metaField=_this.metaEntity.findField(fieldName);
                    var formItem=controlTypeService.buildFormItemByMetaField(metaField);
                    var rules=metaformUtils.initValidation(formItem,_this.metaEntity,_this.entityId,_this.entity);
                    if(rules.length>0) {
                        _this.innerRules[formItem.dataField] = rules;
                    }
                });
            },
            layoutProcessor:function(item){
                if(_.isString(item)){
                    return {
                        ctype:"meta-field",
                        name:item,
                        context:this.fieldContext(item)
                    }
                }
                if(_.has(item,"_value")){
                    item["name"]=item["_value"];
                    delete item["_value"];
                }
                return item;
            }
        }
    }
</script>


