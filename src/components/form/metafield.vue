<template>
    <component v-if="formItem" 
    v-model="innerVal"
    :validator="validator"
    @exDataChanged="exDataChanged" 
    :is="componentName(formItem)"
    :paths="paths" 
    :model="entity"
    :context="{metaEntity,action:fieldStatus}"
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
        title:{
            type:String
        },
        inputType:{
            type:String
        },
        action:{//表示是否查看模式的表单
            type:String
        }
    },
    data:function(){
        var form=this.getParentForm();
        if(!form){
            iview$Modal.error({
                title:"错误",
                content:`必须定义父组件meta-form`
            });
            return {};
        }
        var metaEntity=form.metaEntity;
        var entity=form.entity;
        var metaField=_.cloneDeep(metaEntity.findField(this.name));
        if(!metaField){
            iview$Modal.error({
                title:"错误",
                content:`字段${name}不存在`
            });
            return {};
        }
        this.overrideProps(metaField);
        var formItem=controlTypeService.buildFormItemByMetaField(metaField);
        //初始化字段验证
        if(form){
            metaformUtils.initValidation(form.$validator,formItem,metaEntity,form.entityId);
        }

        return {
            formItem:formItem,
            form:form,
            validator:form?form.$validator:null,
            metaEntity:metaEntity,
            metaField:metaField,
            entity:entity,
            paths:constants.paths
        }
    },
    computed: {
        innerVal: {
            // getter
            get: function () {
                return this.entity[this.metaField.name];
            },
            // setter
            set: function (newValue) {
                this.entity[this.metaField.name]=newValue;
            }
        },
        fieldStatus:function () {
            var status=this.action;
            if(_.isEmpty(status)){
                if(this.form.isView){
                    status=Utils.formActions.view;
                }else{
                    status=Utils.formActions.edit;
                }
            }
            return status;
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
                this.form.exDataChanged(newValue,dataField);
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




