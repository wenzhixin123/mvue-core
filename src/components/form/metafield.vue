<template>
    <FormItem  :prop="name"  :label-for="labelFor" v-show="!innerContext.hidden"
        :rules="rules" :show-message="showMessage">
        <template v-if="showLabel" slot="label">
            <slot name="label">{{ metaField.title}}</slot>
        </template>
        <slot v-if="formItem"
            :model="entity" :metaField="metaField"  :formItem="formItem">
            <component
                v-model="entity[name]"
                :is="componentName(formItem)"
                :paths="paths"
                :model="entity"
                :context="innerContext"
                :form-item="formItem"
                :init-when-create="initWhenCreate" >
            </component>
        </slot>
    </FormItem>
</template>
<script>
import controlTypeService from './js/control_type_service';
import metaformUtils from './js/metaform_utils';
import constants from './js/constants';
import context from "../../libs/context";
import getParent from '../mixins/get-parent';
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
        action:{//表示是否查看模式的表单
            type:String
        },
        entityName:{//在高级查询的时候，会指定entityName参数获取元数据信息，因为此时没有meta-form包裹
            type:String
        },
        preprocessor:{//数据预处理函数，对formItem作预处理转换
            type:Function,
            required: false
        },
        context:{//context的附加数据:{mode:"字段显示模式：readonly/invisible/editable"}
            type:Object,
            require:false
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
        }
    },
    data:function(){
        var entityName=this.entityName;
        var form=this.getParentForm();
        if(!entityName){
            if(!form){
                context.error({
                    title:"错误",
                    content:`必须定义父组件meta-form`
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
                content:`字段${name}不存在`
            });
            return {};
        }
        if(!form){
            //没有表单时，不需要渲染出必填样式
            metaField.required=false;
        }
        this.overrideProps(metaField);
        var formItem=controlTypeService.buildFormItemByMetaField(metaField);
        formItem.componentParams=_.extend(formItem.componentParams,this.params);
        if(this.preprocessor){
            this.preprocessor(formItem,this);
        }
        //初始化字段验证
        var entity=this.model||{},_innerVal=null;
        if(form){
            entity=form.entity;
            //初始化来自entity的初始值
            _innerVal=entity[metaField.name];
        }
        return {
            //innerVal:_innerVal,
            formItem:formItem,
            form:form,
            metaEntity:metaEntity,
            metaField:metaField,
            entity:entity,
            paths:constants.paths()
        }
    },
    computed: {
        innerContext:function(){
            var baseCtx={metaEntity:this.metaEntity,action:this.fieldStatus};
            return Object.assign(baseCtx,this.context);
        },
        fieldStatus:function () {
            var status=this.action;
            if(_.isNil(status)){
                if(this.form&&this.form.isView){
                    status=Utils.formActions.view;
                }else{
                    status=Utils.formActions.edit;
                }
            }
            return status;
        }
    },
    methods:{
        //根据组件传递进来的参数，覆盖metaField的属性
        overrideProps(metaField){
            if(this.title){
                metaField.title=this.title;
            }
            if(this.label){
                metaField.title=this.label;
            }
            if(this.inputType){
                metaField.inputType=this.inputType;
            }
        },
        componentName(formItem){
            return metaformUtils.metaComponentType(formItem);
        }
    }
}
</script>
<style lang="scss" scoped>

</style>




