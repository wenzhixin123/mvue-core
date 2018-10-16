<template>
    <Row>
        <Col span="20" style="border-right:1px solid #e8e8e8;">
            <meta-grid ref="gridList"
                :toolbar="toolbar"
                :highlight-row="!multiple"
                :max-columns-size="5"
                :show-selection="multiple"
                :handle-on-title-click="handleOnTitleClick"
                @on-current-change="handleOnCurrentChange"
                @on-selection-change="handleOnSelectionChange"
                :entity-name="entityName">
            </meta-grid>
        </Col>
        <Col span="4">
            <div class="ref-entity-list-header">
                <h4>已选</h4>
            </div>
            <div class="ref-entity-list-body">
                <template v-if="multiple&&selectedItem">
                    <Tag color="success" v-for="item in selectedItem" :key="item[getIdField()]">{{item[getTitleField()]}}</Tag>   
                </template>
                <Tag color="success" v-if="(!multiple)&&selectedItem">{{selectedItem[getTitleField()]}}</Tag>   
            </div>
        </Col>
    </Row>
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
            type:Object
        },
        multiple:{
            type:Boolean,
            default:false
        }
    }
}
</script>
<style lang="scss">
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
