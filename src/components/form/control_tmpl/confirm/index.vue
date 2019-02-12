<template>
    <m-field 
    :name="name" 
    :title="innerLabel" 
    :propName='innerPropName' 
    :params="params"
    :rules="rules"></m-field>
</template>
<script>
import getParent from '../../../mixins/get-parent';
import metaformUtils from '../../js/metaform_utils';
export default {
    mixins:[getParent],
    props:{
        //下面的属性都是m-field的属性
        name:{
            type:String,
            required:true
        },
        title:{
            type:String
        },
        propName:{
            type:String
        }
    },
    data(){
        return {
            propSuffix:'confirmed',
            labelSuffix:'确认'
        };
    },
    computed:{
        innerPropName(){
            if(this.propName){
                return this.propName;
            }
            return `${this.name}_${this.propSuffix}`;
        },
        innerLabel(){
            if(this.title){
                return this.title;
            }
            let form=this.getParentForm();
            let metaEntity=this.$metaBase.findMetaEntity(form.entityName);
            let metaField=metaEntity.findField(this.name);
            return `${metaField.title}${this.labelSuffix}`;
        },
        params(){
            let _params={};
            _params.placeholder=this.innerLabel;
            return _params;
        },
        rules(){
            let form=this.getParentForm();
            let metaEntity=this.$metaBase.findMetaEntity(form.entityName);
            let _requiredRule=metaformUtils.buildValidationRuleForRequired(this.innerLabel);
            let _rule=metaformUtils.buildValidationRuleForCompare(this.name,"equals",form.entity,metaEntity);
            return [_requiredRule,_rule];
        }
    }
}
</script>
