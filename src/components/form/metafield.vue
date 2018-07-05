<template>
    <component v-if="formItem" 
    v-model="innerVal"
    :validator="validator"
    @exDataChanged="exDataChanged" 
    :is="componentName(formItem)"
    :paths="paths" 
    :model="entity"
    :context="innerContext"
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
        value:{//高级查询v-model使用
            required: false
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
        if(this.preprocessor){
            this.preprocessor(formItem,this);
        }
        //初始化字段验证
        var entity=null,_innerVal=null;
        if(form){
            entity=form.entity;
            //初始化来自entity的初始值
            _innerVal=entity[metaField.name];
            metaformUtils.initValidation(form.$validator,formItem,metaEntity,this.$route.params.id);
        }
        return {
            innerVal:_innerVal,
            formItem:formItem,
            form:form,
            validator:form?form.$validator:null,
            metaEntity:metaEntity,
            metaField:metaField,
            entity:entity,
            paths:constants.paths()
        }
    },
    watch:{
        value:{//同步外部v-model的数据到innerVal，高级查询特用
            handler:function(){
                if(!_.isEqual(this.value,this.innerVal)){
                    this.innerVal=_.cloneDeep(this.value);
                    if(this.entity){
                        this.entity[this.metaField.name]=this.innerVal;
                    }
                }
            },
            deep:true
        },
        innerVal:{//将innerVal的变化反应到entity和外部
            handler:function(){
                if(this.entity){
                    this.entity[this.metaField.name]=this.innerVal;
                }
                this.$emit('input',this.innerVal);
            },
            deep:true
        }
    },
    computed: {
        innerContext:function(){
            var baseCtx={metaEntity:this.metaEntity,action:this.fieldStatus};
            return Object.assign(baseCtx,this.context);
        },
        fieldStatus:function () {
            var status=this.action;
            if(_.isEmpty(status)){
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




