export default {
    data(){
        var entityName=this.formItem.componentParams.entityId;
        return {
            entityName:entityName,
            selectedItem:_.cloneDeep(this.value)
        }
    },
    methods:{
        //单选时生效
        handleOnCurrentChange(currentRow,oldCurrentRow){
            //多选不走这里
            if(this.multiple){
                return;
            }
            this.selectedItem=currentRow;
        },
        //多选时生效
        handleOnSelectionChange(selection){
            if(_.isEmpty(this.selectedItem)){
                this.selectedItem=selection;
            }else if(!_.isEmpty(selection)){
                let idField=this.getIdField();
                let siMap=_.keyBy(this.selectedItem,si=>{
                    return si[idField];
                });
                _.forEach(selection,sel=>{
                    let id=sel[idField];
                    if(!siMap[id]){
                        this.selectedItem.push(sel);
                    }
                });
            }
        },
        //多选时生效，取消选择
        handleOnSelectCancel(selection,row){
            this.handleTagClose(row);
        },
        //点击tab删除
        handleTagClose(item){
            let idField=this.getIdField();
            let newSelectedItem=[];
            _.forEach(this.selectedItem,si=>{
                if(si[idField]!==item[idField]){
                    newSelectedItem.push(si);
                }
            });
            this.selectedItem=newSelectedItem;
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
        },
        shortTitle(item){
            let title=this.title(item);
            if(title.length>10){
                return title.substring(0,10)+'...';
            }
            return title;
        }
    }
}