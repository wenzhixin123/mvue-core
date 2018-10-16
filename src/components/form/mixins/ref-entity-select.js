export default {
    data(){
        var entityName=this.formItem.componentParams.entityId;
        return {
            entityName:entityName,
            toolbar:{
                quicksearch:{},
            },
            selectedItem:_.cloneDeep(this.value)
        }
    },
    methods:{
        handleOnTitleClick:()=>{},//点击标题列，什么都不做
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
        }
    }
}