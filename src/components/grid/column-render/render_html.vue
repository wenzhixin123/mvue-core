<template>
    <m-field v-if="editRow" :name="metaField.name"></m-field>
    <Tooltip v-else-if="initialCol&&initialCol.tooltip" transfer :content="titleValue()" :disabled="!showTooltip" :max-width="300" class="ivu-table-cell-tooltip">
        <span ref="content" @mouseenter="handleTooltipIn" @mouseleave="handleTooltipOut" class="ivu-table-cell-tooltip-content">{{htmlValue()}}</span>
    </Tooltip>
    <div v-else v-html="htmlValue()" :class="{'ivu-table-cell-ellipsis':true}" :title="titleValue()"></div>
</template>
<script>
import batchEditorSupport from './batch-editor-support';
import controlTypeService from '../../form/js/control_type_service';
import constants from '../../form/js/constants';
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
        hasDeletedTag(){
            return this.value&&this.value.indexOf&&this.value.indexOf(controlTypeService.entityType.deletedFlag)>-1;
        },
        hasTitleSplitKey(){
            return this.value&&this.value.indexOf&&this.value.indexOf(constants.TitleSplitKey)>-1;
        },
        htmlValueForDeletedTag(){
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
        },
        htmlValueForTitleSplitKey(){
            let index=this.value.indexOf(constants.TitleSplitKey);
            let value=this.value.substring(0,index);
            return value;
        },
        htmlValue(){
            //如果有删除标记
            if(this.hasDeletedTag()){
                return this.htmlValueForDeletedTag();
            }else if(this.hasTitleSplitKey()){//如果用title分隔符分开了显示值和标题值
                return this.htmlValueForTitleSplitKey();
            }else{
                return this.value;
            }
        },
        titleValueForDeletedTag(){
            let reg = new RegExp(controlTypeService.entityType.deletedFlag,'g');
            if(this.value.startsWith(controlTypeService.entityType.deletedFlag)&&this.value.indexOf(',')<0){
                return `引用数据${this.value.replace(reg,'')}已删除`;
            }
            return this.value.replace(reg,'');
        },
        titleValueForTitleSplitKey(){
            let index=this.value.indexOf(constants.TitleSplitKey);
            let value=this.value.substring(index+constants.TitleSplitKey.length);
            return value;
        },
        titleValue(){
            if(this.hasDeletedTag()){
                return this.titleValueForDeletedTag();
            }else if(this.hasTitleSplitKey()){
                return this.titleValueForTitleSplitKey();
            }else{
                return this.value;
            }
        },
        handleTooltipIn () {
            if(this.hasTitleSplitKey()){
                this.showTooltip=true;
                return;
            }
            const $content = this.$refs.content;
            this.showTooltip = $content.scrollWidth > $content.offsetWidth;
        },
        handleTooltipOut () {
            this.showTooltip = false;
        }
    }
}
</script>


