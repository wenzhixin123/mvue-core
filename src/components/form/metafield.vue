<template>
    <FormItem  :prop="innerPropName"  :label-for="labelFor" v-if="!isHidden()"
        :rules="rules" :show-message="showMessage" :class="{'has-warn-desc':description&&descLevel=='warn'}">
        <template v-if="showLabel" slot="label">
            <slot name="label">{{ metaField.title}}<info-tip v-if="description&&descLevel=='info'" :content="description"></info-tip></slot>
        </template>
        <slot v-if="formItem"
            :model="entity" :metaField="metaField"  :formItem="formItem">
            <component
                v-model="entity[innerPropName]"
                :is="componentName(formItem)"
                :paths="paths"
                :model="entity"
                :first-entity-data="firstEntityData"
                :mode="innerMode"
                :context="context"
                :form-item="formItem"
                :init-when-create="initWhenCreate"
                @input="handleChange"
            >
            </component>
            <div v-if="description&&descLevel=='warn'" v-text="description"></div>
        </slot>
    </FormItem>
</template>
<script>
import controlTypeService from './js/control_type_service';
import metaformUtils from './js/metaform_utils';
import constants from './js/constants';
import context from "../../libs/context";
import getParent from '../mixins/get-parent';
import widgetMode from './js/widget-mode';
export default {
    mixins:[getParent],
    props:{
        name:{
            type:String,
            required:true
        },
        title:{
            type:String
        },
        inputType:{
            type:String
        },
        entityName:{//在高级查询的时候，会指定entityName参数获取元数据信息，因为此时没有meta-form包裹
            type:String
        },
        preprocessor:{//数据预处理函数，对formItem作预处理转换
            type:Function,
            required: false
        },
        context:{//context
            type:Object,
            default(){
                return {};
            }
        },
        mode:{//组件输入状态控制widgetMode定义：可编辑、不可见、只读、查看(readonly/invisible/forceView)
            type:String
        },
        model:{//高级查询model
            required: false
        },
        showLabel:{
            type:Boolean,
            default:true
        },
        label:{
            type:String
        },
        rules:{
            type:[Object,Array],
            default:function () {
                return null;
            }
        },
        required:{
            type:Boolean,
        },
        error:{
            type:String,
        },
        showMessage:{
            type:Boolean,
            default:true
        },
        labelFor:{
            type:String
        },
        labelWidth:{
            type:Number,
            default:0
        },
        initWhenCreate:{
            type:Boolean,
            default:false
        },
        params:{
            type:Object,
            default:function () {
                return {};
            }
        },
        propName:{
            type:String
        },
        batchField:{
            type:Boolean,
            default:false
        },
        ignoreAutoMode:{//是否自动设置组件的readonly模式等，默认自动，高级查询时不自动
            type:Boolean,
            default:false
        }
    },
    watch:{
        title:function (newVal,oldVal) {
            if(newVal){
                this.metaField.title=newVal;
            }
        },
        mode:function (newVal,oldVal) {
            let _mode=newVal;
            if(_mode==null &&!this.ignoreAutoMode){
                _mode=this.getInnerMode(this.metaField);
            }
            this.innerMode= _mode;
        }
    },
    data:function(){
        var entityName=this.entityName;
        var form=this.getParentForm();
        if(!entityName){
            if(!form){
                context.error({
                    title:"错误",
                    content:`必须定义父组件m-form`
                });
                return {};
            }
            entityName=form.entityName;
        }
        if(!entityName){
            context.error({
                title:"错误",
                content:`实体名称无法确定`
            });
            return {};
        }
        var metaEntity=this.$metaBase.findMetaEntity(entityName);
        if(!metaEntity){
            context.error({
                title:"错误",
                content:`实体${entityName}不存在`
            });
            return {};
        }
        var metaField=_.cloneDeep(metaEntity.findField(this.name));
        if(!metaField){
            context.error({
                title:"错误",
                content:`字段${this.name}不存在`
            });
            return {};
        }
        if(!form){
            //没有表单时，不需要渲染出必填样式
            metaField.required=false;
        }
        //默认不在批量编辑grid中
        let inBatchEditor=false;
        if(form){
            //如果在form中，继承form的inBatchEditor属性
            inBatchEditor=form.inBatchEditor;
        }
        this.overrideProps(metaField,inBatchEditor);
        var formItem=controlTypeService.buildFormItemByMetaField(metaField);
        formItem.componentParams=_.extend(formItem.componentParams,this.params);
        //构造字段描述
        var description=null;
        if(formItem.componentParams.description){
            description=formItem.componentParams.description;
        }
        let descLevel=formItem.componentParams.descLevel||'info';
        if(this.preprocessor){
            this.preprocessor(formItem,this);
        }
        //初始化字段验证
        var entity=this.model||{},firstEntityData=null,_innerVal=null;
        if(form){
            entity=form.entity;
            firstEntityData=form.firstEntityData;
            //初始化来自entity的初始值
            _innerVal=entity[metaField.name];
            //如果在表单内部使用m-field组件，大部分都是如此，isCreate继承自表单
            this.context.isCreate=form.isCreate;
            this.context.isEdit=form.isEdit;
        }else{
            //非表单组件内部，高级查询独立使用必定为创建模式
            this.context.isCreate=true;
        }
        //批量数据表单，会增加一个非属性字段，propName用来指定这个非属性字段，
        //除了名字不一样和原始字段的渲染方式需要转换为批量组件渲染
        let innerPropName=this.propName||this.name;
        if(this.batchField){
            //转换逻辑：单选到多选；单引用实体到多引用实体
            let mapping={
                SingleSelect:controlTypeService.componentTypes.MultiSelect.id,
                SingleUserSelect:controlTypeService.componentTypes.MultiUserSelect.id,
                SingleOrgSelect:controlTypeService.componentTypes.MultiOrgSelect.id,
                RefEntity:controlTypeService.componentTypes.MultiRefEntity.id
            };
            if(mapping[formItem.componentType]){
                formItem.componentType=mapping[formItem.componentType];
            }
        }
        let _mode=this.mode;
        if(!this.ignoreAutoMode){
            _mode=this.getInnerMode(metaField);
        }
        return {
            innerMode:_mode,
            formItem:formItem,
            form:form,
            metaEntity:metaEntity,
            metaField:metaField,
            entity:entity,
            firstEntityData:firstEntityData,
            paths:constants.paths(),
            description:description,
            descLevel:descLevel,//指定description出现的位置，info在label旁边提示，warn在控件下边提示
            innerPropName:innerPropName
        }
    },
    methods:{
        getInnerMode(metaField){
            //如果是编辑模式，默认不可更新的字段自动变成只读模式
            if(this.context.isEdit &&
            ((!this.mode)||this.mode===widgetMode.editable) &&
            metaField.updatable===false
            ){
                return widgetMode.readonly;
            }
            //如果是创建模式，默认不可创建的字段自动变成只读模式
            if(this.context.isCreate &&
            ((!this.mode)||this.mode===widgetMode.editable) &&
            metaField.creatable===false
            ){
                return widgetMode.readonly;
            }
            return this.mode;
        },
        //根据组件传递进来的参数，覆盖metaField的属性
        overrideProps(metaField,inBatchEditor){
            if(this.title){
                metaField.title=this.title;
            }
            if(this.label){
                metaField.title=this.label;
            }
            if(this.inputType){
                metaField.inputType=this.inputType;
            }
            //inBatchEditor为true，表示在批量编辑grid中，这时候因为grid的样式，需要将CheckboxGroup等转换为下拉框显示
            let convertMap={
                "RadioButton":"SingleSelect",
                "CheckboxGroup":"MultiSelect"
            }
            if(inBatchEditor){
                for (const key in convertMap) {
                    if(metaField.inputType==key){
                        metaField.inputType=convertMap[key];
                    }
                }
            }
        },
        componentName(formItem){
            return metaformUtils.metaComponentType(formItem);
        },
        isHidden(){
            if(this.context&&this.context.hidden){
                return true;
            }
            var mode=this.mode||(this.context&&this.context.mode);
            if(mode==widgetMode.invisible){
                return true;
            }
            return false;
        },
        handleChange(event){
            this.$emit("on-change",event);
            if(this.form){
                this.form.handleFormItemChange(event,this);
            }
        }
    },
    components:{
        infoTip:require('./info-tip')
    }
}
</script>




