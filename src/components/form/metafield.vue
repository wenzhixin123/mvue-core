<template>
    <component v-if="formItem" 
    v-model="innerValue" 
    :validator="validator"
    @exDataChanged="exDataChanged" 
    :is="'Meta'+formItem.componentType"
    :paths="paths" 
    :model="innerModel"
    :form-item="formItem">
    </component>
</template>
<script>
import controlTypeService from './js/control_type_service';
import metaformUtils from './js/metaform_utils';
import constants from './js/constants';
export default {
    props:{
        name:{
            type:String,
            required:true
        },
        value:{
            required:true
        },
        entityName:{
            type:String
        },
        title:{
            type:String
        },
        inputType:{
            type:String
        },
        model:{
            type:Object
        }
    },
    data:function(){
        var entityName=this.entityName;
        var form=this.getParentForm();
        if(!entityName){
            if(!form){
                iview$Modal.error({
                    title:"错误",
                    content:`必须定义父组件meta-form`
                });
                return {};
            }
            entityName=form.entityName;
        }
        if(!entityName){
            iview$Modal.error({
                title:"错误",
                content:`实体名称无法确定`
            });
            return {};
        }
        var metaEntity=this.$metaBase.findMetaEntity(entityName);
        if(!metaEntity){
            iview$Modal.error({
                title:"错误",
                content:`实体${entityName}不存在`
            });
            return {};
        }
        var metaField=_.cloneDeep(metaEntity.findField(this.name));
        if(!metaField){
            iview$Modal.error({
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
        //初始化字段验证
        if(form){
            if(!this.model){
                this.innerModel=form.model;
            }
            metaformUtils.initValidation(form.$validator,formItem,metaEntity,this.$route.params.id);
        }
        return {
            innerValue:_.cloneDeep(this.value),
            formItem:formItem,
            validator:form?form.$validator:null,
            metaEntity:metaEntity,
            form:form,
            innerModel:_.cloneDeep(this.model),
            paths:constants.paths
        }
    },
    watch:{
        value:{
            handler:function(){
                if(!_.isEqual(this.value,this.innerValue)){
                    this.innerValue=_.cloneDeep(this.value);
                }
            },
            deep:true
        },
        innerValue:{
            handler:function(){
                this.$emit('input',this.innerValue);
            },
            deep:true
        }
    },
    methods:{
        getParentForm(){//不停的向上找父表单组件
            var _parent=this.$parent;
            while(_parent){
                if(_parent.isMetaForm){
                    return _parent;
                }else{
                    _parent=_parent.$parent;
                }
            }
            return null;
        },
        //根据组件传递进来的参数，覆盖metaField的属性
        overrideProps(metaField){
            if(this.title){
                metaField.title=this.title;
            }
            if(this.inputType){
                metaField.inputType=this.inputType;
            }
        },
        //表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
        exDataChanged:function(newValue,dataField){
            if(this.form){
                this.form.$emit("exDataChanged",newValue,dataField);
            }
        }
    }
}
</script>
<style lang="scss" scoped>

</style>




