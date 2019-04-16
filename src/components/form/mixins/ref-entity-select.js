export default {
    data(){
        var entityName=this.formItem.componentParams.entityId;
        return {
            entityName:entityName,
            selectedItem:_.cloneDeep(this.value)
        }
    },
    methods:{
        //单选
        handleOnCurrentChange(currentRow,oldCurrentRow){
            //多选不走这里
            if(this.multiple){
                return;
            }
            this.selectedItem=currentRow;
        },
        //多选
        handleOnSelectionChange(selection){
            this.selectedItem=selection;
        },
        getIdField:function(){
            return this.formItem.componentParams.idField;
        },
        getTitleField:function(){
            return this.formItem.componentParams.titleField;
        },
        title(item){
            let titleFieldName=this.getTitleField();
            let titleField=this.$metaBase.findMetaEntity(this.entityName).findField(titleFieldName);
            let r=titleField.manyToOneRelation;
            //如果是标题字段是多对一关系字段，使用展开的关系实体的标题显示，而不是id
            if(r){
                let name=r.name;
                if(item[name]){
                    let targetEntityTitleFieldName=this.$metaBase.findMetaEntity(r.targetEntity).firstTitleField().name;
                    return item[name][targetEntityTitleFieldName];
                }
            }
            return item[titleFieldName];
        }
    }
}