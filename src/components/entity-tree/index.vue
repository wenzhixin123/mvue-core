<template>
    <m-simple-tree :multiple="false" :data="treeData"
            :load-data="queryByParent"
            :must-select="mustSelect"
            @on-select-change="handleSelectChange"
            @on-check-change="handleCheckChange"
            @on-toggle-expand="handleToggleExpand"></m-simple-tree>
</template>

<script>
    import  treeBase from "./entity-tree";
    export default {
        mixins: [treeBase],
        mounted:function () {
            if(this.loadDataWhenMount){
                this.buildRoot();
            }
        },
        methods:{
            handleSelectChange:function (data) {
                this.$emit("on-select-change",data);
            },
            handleCheckChange:function (data) {
                this.$emit("on-check-change",data);
            },
            handleToggleExpand:function (data) {
                this.$emit("on-toggle-expand",data);
            }
        }
    }
</script>