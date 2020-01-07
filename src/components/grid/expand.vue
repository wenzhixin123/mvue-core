<template>
  <div>
    <Row v-for="row in fullRows" :key="row" type="flex">
      <i-col v-for="col in colSize" :key="col" :span="24/colSize" style="display:flex;">
        {{title(row,col)}}:&nbsp;
        <expand-item :value="displayValue(row,col)" :initial-col="initialCol"></expand-item>
      </i-col>
    </Row>
    <Row v-if="residualRow>0" type="flex">
      <i-col v-for="col in residualRow" :key="col" :span="24/colSize" style="display:flex;">
        {{title(fullRows+1,col)}}:&nbsp;
        <expand-item :value="displayValue(fullRows+1,col)" :initial-col="initialCol"></expand-item>
      </i-col>
    </Row>
  </div>
</template>
<script>
import controlTypeService from '../form/js/control_type_service';
export default {
  components:{
    expandItem:require('./expand-item').default
  },
  props:{
    item:{
      type:Object,
      required:true
    },
    context:{
      type:Object,
      required:true
    },
    initialCol:{
      type:Object,
      required:true
    }
  },
  data(){
    let expandProp=this.context.grid.expand;
    let colSize=expandProp.colSize;
    let columns=this.getColumns();
    return {
      colSize:colSize||2,
      columns:columns
    };
  },
  computed:{
    fullRows(){
      return Math.floor(this.columns.length/this.colSize);
    },
    residualRow(){
      return this.columns.length%this.colSize;
    }
  },
  methods:{
    getColumns(){
      let columns=[];
      let listCom=this.context.grid.$refs.listInst;
      let initialColumns=listCom.innerColumns;
      let visibleColumns=listCom.visibleColumns;
      let visibleColumnsMap=_.keyBy(visibleColumns,vc=>{
        return vc.key;
      });
      initialColumns.forEach(col => {
        if(!visibleColumnsMap[col.key]){
          let metaField=this.context.grid.metaEntity.findField(col.key);
          if(metaField){
            columns.push(col);
          }
        }
      });
      return columns;
    },
    getCol(rowIdx,colIdx){
      let colIndex=(rowIdx-1)*this.colSize+colIdx-1;
      let col=this.columns[colIndex];
      return col;
    },
    title(rowIdx,colIdx){
      let col=this.getCol(rowIdx,colIdx);
      return col.title;
    },
    displayValue(rowIdx,colIdx){
      let col=this.getCol(rowIdx,colIdx);
      let metaField=this.context.grid.metaEntity.findField(col.key);
      let value=controlTypeService.formatData(this.item, metaField,'grid');
      return value;
    }
  }
}
</script>
