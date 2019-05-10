<template>
    <m-field v-if="editRow" :name="metaField.name"></m-field>
    <Tooltip v-else-if="initialCol&&initialCol.tooltip" transfer :content="titleValue()" :disabled="!showTooltip" :max-width="300" class="ivu-table-cell-tooltip">
        <span ref="content" @mouseenter="handleTooltipIn" @mouseleave="handleTooltipOut" class="ivu-table-cell-tooltip-content">{{ titleValue() }}</span>
    </Tooltip>
    <div v-else v-html="htmlValue()" :class="{'ivu-table-cell-ellipsis':true}" :title="titleValue()"></div>
</template>
<script>
import batchEditorSupport from './batch-editor-support';
import controlTypeService from '../../form/js/control_type_service';
export default {
    mixins:[batchEditorSupport],
    props:{
        value:{
            required:true
        },
        initialCol:{
            type:Object
        }
    },
    data(){
        return {
            showTooltip:false
        }
    },
    methods:{
        htmlValue(){
            if(this.value&&this.value.indexOf&&this.value.indexOf(controlTypeService.entityType.deletedFlag)>-1){
                let reg = new RegExp(controlTypeService.entityType.deletedFlag,'g');
                let titles=this.value.split(',');
                let t=[];
                _.each(titles,title=>{
                    if(title.startsWith(controlTypeService.entityType.deletedFlag)){
                        t.push(`<span class='deleted-ref'>${title.replace(reg,'')}</span>`);
                    }else{
                        t.push(title);
                    }
                })
                return t.join(',');
            }else{
                return this.value;
            }
        },
        titleValue(){
            if(this.value&&this.value.indexOf&&this.value.indexOf(controlTypeService.entityType.deletedFlag)>-1){
                let reg = new RegExp(controlTypeService.entityType.deletedFlag,'g');
                if(this.value.startsWith(controlTypeService.entityType.deletedFlag)&&this.value.indexOf(',')<0){
                    return `引用数据${this.value.replace(reg,'')}已删除`;
                }
                return this.value.replace(reg,'');
            }else{
                return this.value;
            }
        },
        handleTooltipIn () {
            const $content = this.$refs.content;
            this.showTooltip = $content.scrollWidth > $content.offsetWidth;
        },
        handleTooltipOut () {
            this.showTooltip = false;
        }
    }
}
</script>


