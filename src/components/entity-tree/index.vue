<template>
    <Tree :multiple="false" :data="treeData"
            :load-data="queryByParent"
            @on-select-change="handleSelectChange"
            @on-check-change="handleCheckChange"
            @on-toggle-expand="handleToggleExpand"></Tree>
</template>

<script>
    import  treeBase from "./entity-tree";
    export default {
        mixins: [treeBase],
        mounted:function () {
            this.buildRoot();
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