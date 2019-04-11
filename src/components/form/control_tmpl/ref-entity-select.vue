<template>
<div>
    <div style="width:20%;position:absolute;z-index:1;right:0px;">
        <div class="ref-entity-list-header">
            <h4>已选</h4>
        </div>
        <div class="ref-entity-list-body">
            <template v-if="multiple&&selectedItem">
                <Tag color="success" v-for="item in selectedItem" :key="item[getIdField()]" :title="title(item)">{{title(item)}}</Tag>   
            </template>
            <Tag color="success" v-if="(!multiple)&&selectedItem" :title="title(selectedItem)">{{title(selectedItem)}}</Tag>   
        </div>
    </div>
    <div style="width:80%;">
        <Row>
            <Col span="24" style="border-right:1px solid #e8e8e8;">
                <meta-grid ref="gridList"
                    :toolbar="toolbar"
                    :highlight-row="!multiple"
                    :max-columns-size="5"
                    :show-selection="multiple"
                    :handle-on-title-click="false"
                    @on-current-change="handleOnCurrentChange"
                    @on-selection-change="handleOnSelectionChange"
                    :entity-name="entityName">
                </meta-grid>
            </Col>
        </Row>
    </div>
</div>
</template>
<script>
import refEntitySelect from '../mixins/ref-entity-select';
export default {
    mixins:[refEntitySelect],
    props:{
        formItem:{
            type:Object,
            required:true
        },
        value:{
            type:[Array,Object]
        },
        multiple:{
            type:Boolean,
            default:false
        }
    }
}
</script>
<style lang="less">
.ref-entity-list-header{
    padding: 8px 16px;
    background: #f9fafc;
    color: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid #e8e8e8;
    overflow: hidden;
    width: 100%;
}
.ref-entity-list-body{
    padding:16px 0px 0px 16px;
}
</style>
