<template>
    <Form v-if="preprocessed" :ref="'formRef'" :model="entity"
          :rules="innerRules" :inline="inline" :label-position="labelPosition" :label-width="labelWidth"
          :show-message="showMessage" :autocomplete="autocomplete">
        <slot>
            <template v-if="innerMetaForm && innerMetaForm.layout">
                <div v-for="formItem in innerMetaForm.layout" :key="formItem.id">
                        <component v-if="formItem.isContainer" :is="'Meta'+formItem.componentType" :form-item="formItem">
                            <div v-for="containerFormItem in formItem.children" :key="containerFormItem.id" v-show="!containerFormItem.hidden">
                                <FormItem v-if="containerFormItem.isDataField" :label="containerFormItem.componentParams.title" :prop="containerFormItem.dataField" v-show="!containerFormItem.hidden">
                                    <component :context="fieldContext(formItem)"  v-model="entity[containerFormItem.dataField]" @exDataChanged="exDataChanged" :is="componentName(formItem)" :form-item="containerFormItem" :paths="paths" :model="entity"></component>
                                </FormItem>
                                <FormItem v-else-if="containerFormItem.isExternal" :label="containerFormItem.componentParams.title" v-show="!containerFormItem.hidden">
                                    <component :context="fieldContext(formItem)" @on-register-after-save-chain="registerAfterSaveChain" :is="componentName(containerFormItem)" :form-item="containerFormItem" :paths="paths" :model="entity"></component>
                                </FormItem>
                                <component v-else :is="'Meta'+containerFormItem.componentType" :form-item="containerFormItem"></component>
                            </div>
                        </component>
                        <FormItem v-else-if="formItem.isDataField" :label="formItem.componentParams.title" :prop="formItem.dataField" v-show="!formItem.hidden">
                            <component  :context="fieldContext(formItem)"  v-model="entity[formItem.dataField]" @exDataChanged="exDataChanged" :is="componentName(formItem)" :form-item="formItem" :paths="paths" :model="entity"></component>
                        </FormItem>
                        <FormItem v-else-if="formItem.isExternal" :label="formItem.componentParams.title" v-show="!formItem.hidden">
                            <component :context="fieldContext(formItem)" @on-register-after-save-chain="registerAfterSaveChain" :is="componentName(formItem)" :form-item="formItem" :paths="paths" :model="entity"></component>
                        </FormItem>
                        <component v-else :is="'Meta'+formItem.componentType" :form-item="formItem"></component>
                    </div>
            </template>
        </slot>
        <FormItem v-if="hasButtons() || $slots.toolbar" class="form-toolbar"
                v-transfer-dom="'#default-form-uuid-'+entityName" :data-transfer="transfer">
            <slot name="toolbar" >
                <template v-if="isView">
                    <meta-operation v-for="btn in innerToolbar.viewBtns" v-if="!btnIsHidden(btn)" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button slot-scope="{operation}" :disabled="btnIsDisabled(operation)" :type="operation.btnType || 'primary'"  :title="operation.title">
                            <Icon :type="operation.icon" v-if="operation.icon"></Icon>
                            {{operation.title}}
                        </Button>
                    </meta-operation>
                </template>
                <template v-if="!isView">
                    <meta-operation v-for="btn in innerToolbar.editBtns" v-if="!btnIsHidden(btn)" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button slot-scope="{operation}" :disabled="btnIsDisabled(operation)" :type="operation.btnType || 'primary'"  :title="operation.title">
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
    import metaformUtils from '../form/js/metaform_utils';
    import controlTypeService from '../form/js/control_type_service';
    import initByMetadata from '../form/init-by-metadata';
    import initByMetaForm from './init-by-metaform';
    import formBase from '../form/form-base';
    import metaservice from '../../services/meta/metaservice';
    import widgetMode from '../form/js/widget-mode';
    export default {
        mixins:[formBase],
        props:{
            formId:{//表单配置id
                type:String,
                required:false
            },
            metaForm:{//表单配置数据，与formId二选一
                type:Object,
                required:false
            }
        },
        data:function(){
            if((!this.formId) && (!this.metaForm)){
                this.$Modal.error({
                    content:"formId或metaForm属性必须二选一"
                });
                return {};
            }else if(this.metaForm&&(!this.metaForm.metaEntityName)){
                this.$Modal.error({
                    content:"metaForm必须指定metaEntityName属性"
                });
                return {};
            }
            return {
                entityName:null,
                innerMetaForm:null
            };
        },
        watch:{
            formId:{
                handler(){
                    if(this.formId){
                        metaservice().getFormByShortId({id:this.formId,resolve:true}).then(({ data:metaForm }) => {
                            this.initByMetaForm(metaForm);
                        });
                    }
                },
                immediate:true
            },
            metaForm:{
                handler(){
                    //属性传入的视图配置数据metaView
                    if(this.metaForm){
                        this.initByMetaForm(this.metaForm);
                    }
                },
                immediate:true
            }
        },
        methods:{
            initByMetaForm(metaForm){
                this.innerMetaForm=metaForm;
                var metaEntity=this.$metaBase.findMetaEntity(metaForm.metaEntityName);
                this.metaEntity=metaEntity;
                this.entityName=metaForm.metaEntityName;
                this.dataResource=metaEntity.dataResource();
                this.entity=metaEntity.getDefaultModel();

                //创建模式，继续初始化，因为初始模型数据已经存在了
                if(this.isCreate){
                    //先根据后端定义填充所有属性的默认值
                    this.metaEntity.fillDefault(this.entity).then(_entity=>{
                        this.entity=_entity;
                        //如果url参数是实体的字段则填充相应的模型数据
                        initByMetadata.initModelByQueryParams(this,this.entity);
                        this.initOthers();
                    });
                }else{//编辑或查看模式，需要从后端获取实体记录数据覆盖初始的模型数据，之后再继续初始化
                    this.reinitEntityModel();
                }
            },
            initOthers(){
                this.continueInitByMetaForm();
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
            //实体已经在控制台定义过表单，由表单元数据生成表单
            continueInitByMetaForm(){
                var metaForm=this.innerMetaForm;
                //初始化验证规则
                initByMetaForm.initValidation(this,metaForm);
                //执行表单脚本
                initByMetaForm.handleFormScript(this,metaForm);
                //处理选择某个选项时，显示和隐藏某些组件逻辑
                initByMetaForm.handleFieldOptionsToggle(this,metaForm);
            },
            //begin 执行表单脚本步骤中可调用的实例方法
            setValue(fieldName,newValue){//设置fieldName字段的值为newValue
                this.entity[fieldName]=newValue;
            },
            getValue(fieldName){//获取fieldName字段的值
                return this.entity[fieldName];
            },
            showField(fieldName){//显示fieldName字段
                var formItem=metaformUtils.formItemByFieldName(this.innerMetaForm,fieldName);
                if(formItem){
                    formItem.hidden=false;
                }
            },
            hideField(fieldName){//隐藏fieldName字段
                var formItem=metaformUtils.formItemByFieldName(this.innerMetaForm,fieldName);
                if(formItem){
                    formItem.hidden=true;
                }
            },
            //end 执行表单脚本步骤中可调用的实例方法
            componentName(formItem){
                return metaformUtils.metaComponentType(formItem);
            }
        }
    }
</script>


