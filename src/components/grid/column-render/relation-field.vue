<template>
    <div v-html="value" :class="{'ivu-table-cell-ellipsis':true}" :title="value"></div>
</template>
<script>
import controlTypeService from '../../form/js/control_type_service';
export default {
    props:{
        item:{
            type:Object,
            required:true
        },
        column:{
            type:Object,
            required:true
        },
        targetField:{
            type:Object,
            required:true
        }
    },
    data(){
        let names=this.column.key.split('.');
        let relationName=names[0];
        let targetEntityField=names[1];
        let expandData=this.item[relationName];
        var value = controlTypeService.formatData(expandData, this.targetField);
        return {
            value:value
        };
    }
}
</script>
