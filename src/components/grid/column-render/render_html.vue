<template>
    <Tooltip v-if="initialCol&&initialCol.tooltip" transfer :content="value" :disabled="!showTooltip" :max-width="300" class="ivu-table-cell-tooltip">
        <span ref="content" @mouseenter="handleTooltipIn" @mouseleave="handleTooltipOut" class="ivu-table-cell-tooltip-content">{{ value }}</span>
    </Tooltip>
    <div v-else v-html="value" :class="{'ivu-table-cell-ellipsis':true}" :title="value"></div>
</template>
<script>
export default {
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


