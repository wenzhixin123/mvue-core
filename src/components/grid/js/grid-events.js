export default {
  methods: {
    handleOnCurrentChange(currentRow,oldCurrentRow){
      this.$emit("on-current-change",currentRow,oldCurrentRow);
    },
    handleOnSelect(selection,row){
      this.$emit("on-select",selection,row);
    },
    handleOnSelectCancel(selection,row){
      this.$emit("on-select-cancel",selection,row);
    },
    handleOnSelectAll(selection){
      this.$emit("on-select-all",selection);
    },
    handleOnSelectAllCancel(selection){
      this.$emit("on-select-all-cancel",selection);
    },
    handleOnSelectionChange(selection){
      if(this.topEntityRowOn&&this.metaEntity){
        if(selection.length==1){
          this.setTopEntityRowIfNecessary(selection[0]);
        }else if(selection.length==0){
          this.$store.commit('core/setTopEntityRow','');
        }
      }
      this.selectedItems=selection;
      this.$emit("on-selection-change",selection);
    },
    handleSortChange({column,key,order}){
      this.$emit("on-sort-change",{column,key,order});
    },
    handleOnFilterChange(row){
      this.$emit("on-filter-change",row);
    },
    setTopEntityRowIfNecessary(row){
      if(this.topEntityRowOn&&this.metaEntity){
        let metaEntity = this.metaEntity;
        let idFieldName=metaEntity.getIdField().name;
        let topEntityRow=`${metaEntity.name}/${row[idFieldName]}`;
        this.$store.commit('core/setTopEntityRow',topEntityRow);
      }
    },
    handleOnRowClick(row,index){
      this.setTopEntityRowIfNecessary(row);
      this.$emit("on-row-click",row,index);
    },
    handleOnRowDblclick(row,index){
      this.$emit("on-row-dblclick",row,index);
    },
    handleOnExpand(row,status){
      this.$emit("on-expand",row,status);
    },
  }
}