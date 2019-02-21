export default{
    props:{
        item:{
            type:Object,
            required:true
        },
        context:{
            type:Object,
            required:true
        },
        metaField:{
            type:Object,
            required:true
        }
    },
    computed:{
        editRow(){
            if((!this.context)||(!this.item)){
                return false;
            }
            let grid=this.context.grid;
            if(!grid){
                return false;
            }
            let editRow=grid.editRow;
            if((!editRow)&&(!editRow===0)){
                return false;
            }
            let metaEntity=grid.metaEntity;
            let idFieldName=metaEntity.getIdField().name;
            //当且仅当当前行的id和grid选中的id相等时，并且已经开启了编辑行，返回true
            if(this.item[idFieldName]===editRow){
                return true;
            }
            return false;
        }
    }
}