<template>
    <div :class="{'ivu-table-cell-ellipsis':true}">
        <span class="ivu-tag-dot-inner" :title="optionsMap[item[metaField.name]]" :style="{background:colorMap[item[metaField.name]]}"></span>
    </div>
</template>
<script>
export default {
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
        },
        options:{
            type:Array,
            required:true
        }
    },
    data(){
        let optionsMap={};
        this.options.forEach(ele => {
            optionsMap[ele.id]=ele.text;
        });
        return {
            optionsMap:optionsMap,
            colorMap:{
                unsaved:'blue',
                failed:'red',
                saved:'green'
            }
        }
    }
}
</script>

