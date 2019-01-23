<template>
    <FormItem>
        <template v-if="showLabel" slot="label">
            <slot name="label">{{innerTitle}}<info-tip v-if="description" :content="description"></info-tip></slot>
        </template>
        <div class="form-item-view" v-if="entity&&entity[refField]">
            <item-render :render="fieldRender" :meta-field="metaField" :entity="entity"></item-render>
        </div>
        <div class="form-item-view" v-else>
            --
        </div>
    </FormItem>
</template>
<script>
import getParent from '../../../mixins/get-parent';
import itemRender from './item-render';
import renderManager from '../../../grid/js/metagrid_render';
import controlTypeService from '../../js/control_type_service';
export default {
    mixins:[getParent],
    components: {itemRender},
    props:{
        showLabel:{
            type:Boolean,
            default:true
        },
        title:{
            type:String
        },
        description:{
            type:String
        },
        name:{//由.号分隔，表示展开某个字段或者关系，expandField.refField或者expandRelation.refField
            type:String,
            required:true,
            validator(value){
                return value.indexOf('.')>0;
            }
        }
    },
    data(){
        let names=this.name.split('.');
        let metaForm=this.getParentForm();
        //必须在表单内部使用，未找到父表单，返回空data
        if(!metaForm){
            return {};
        }
        let expandField=names[0], refField=names[1],innerTitle=this.title,relation=null;
        let metaEntity=metaForm.metaEntity;
        let metaField=metaEntity.findField(expandField);
        if(!metaField){
            let relations=metaEntity.relations;
            relation=relations[expandField];
            if(relation){
                expandField=relation.joinFields[0];
                metaField=metaEntity.findField(expandField)
            }else{
                return {};
            }
        }else{
            relation=metaField.manyToOneRelation;
        }
        let targetEntity=this.$metaBase.findMetaEntity(relation.targetEntity);
        let targetEntityMetaField=targetEntity.findField(refField);
        //如果外部不指定title用引用实体的字段标题
        if(!innerTitle){
            innerTitle=targetEntityMetaField.title;
        }
        return {
            expandField:metaField.name,    
            refField:targetEntityMetaField.name,
            innerTitle:innerTitle,
            metaField:targetEntityMetaField
        };
    },
    computed:{
        entity(){
            let metaForm=this.getParentForm();
            if(!metaForm){
                return '';
            }
            let refEntities=this.$store.state.core.formStatus.refEntities;
            let id=metaForm.id||this.$store.state.core.defaultFormId;
            let curFormRefEntities=refEntities[id];
            let refEntity=curFormRefEntities[this.expandField];
            return refEntity||{};
        }
    },
    methods:{
        fieldRender(h,params){
            let metaField=this.metaField;
            let render=null;
            if (controlTypeService.isPictureUpload(metaField.inputType)) {
                render = renderManager.renderForPictureUpload(null,metaField);
            } else if (controlTypeService.isFileUpload(metaField.inputType)) {
                render = renderManager.renderForFileUpload(null,metaField);
            } else {
                render = renderManager.renderForCommon(null,metaField);
            }
            return render(h,params);
        }
    }
}
</script>
