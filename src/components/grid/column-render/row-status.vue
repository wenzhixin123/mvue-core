<template>
    <div :class="{'ivu-table-cell-ellipsis':true}">
        <Tag :color="colorMap[item[metaField.name]]">{{optionsMap[item[metaField.name]]}}</Tag>
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
                unsaved:'cyan',
                failed:'red',
                saved:'green'
            }
        }
    }
}
</script>

