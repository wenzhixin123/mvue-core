<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItem)">
                <div v-text="viewModeValue"></div>
            </div>
        </template>
        <template v-else>
            <div class="bvue-select-wrapper bvue-select-group bvue-select-with-append">
                <Multiselect :multiple="true" v-model="selectedItem"
                            :options="dataItems"
                            :placeholder="formItem.componentParams.placeholder||'请输入部门名称'"
                            :disabled="disabled"
                            select-label="按enter键选择"
                            selected-label="已选"
                            deselect-label="按enter键取消选择"
                            :show-no-results="false"
                            :label="getTitleField()"
                            @search-change="searchChange"
                            :track-by="getIdField()">
                    <template slot="option" slot-scope="props">
                        <div class="option__desc">
                            <span class="option__title">{{ props.option[getTitleField()] }}</span>
                        </div>
                    </template>
                    <template slot="noResult">
                        根据关键字，搜索不到任何部门
                    </template>
                    <template slot="noOptions">
                        无部门数据
                    </template>
                </Multiselect>
                <div class="ivu-btn ivu-btn-primary bvue-select-group-append" @click="toggleModal">
                    <Icon :type="btnIcon"></Icon>
                </div>
                <Modal class="bvue-select-modal" v-model="popupWidgetModal"
                        :width="modalWidth"
                        :title="modalTitle"
                        :scrollable="true"
                        :mask-closable="false"
                        >
                        <div class="bvue-select-modal" :style="{height:modalHeight+'px',overflow:'auto'}">
                            <select-org ref="selectRef" v-if="popupWidgetModal"
                            :initial-value="value"
                            :multiple="true"
                            :label-key="getTitleField()"
                            :value-key="getIdField()"
                            :query-placeholder="selectPlaceholder"
                            :tree-expand-level="treeExpandLevel"
                            :tree-leaf-key="treeLeafKey"
                            :query-methods="queryMethods"></select-org>
                        </div>
                        <div slot="footer">
                            <Button type="default" @click="close">取消</Button>
                            <Button type="primary" @click="confirmSelect">确定</Button>
                        </div>
                </Modal>
            </div>
        </template>
    </div>
</template>
<script>
import context from '../../../libs/context';
import controlBase from '../js/control_base';
import entitySelect from '../mixins/entity-select';
import selectModal from '../mixins/select-modal';
import selectOrgBase from './org-select/select-org-base';
export default {
    mixins: [controlBase,entitySelect,selectModal,selectOrgBase],
    props: {
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    data: function(){
        let entityResource=null;
        if(this.paths&&this.paths.orgApiUrl){
            entityResource= context.buildResource(this.paths.orgApiUrl);
        }
        return {
            selectedItem:[],//已经选择的项
            entityResource:entityResource,//获取部门数据的操作resource
            queryFields:this.buildSelectFields(),//查询的冗余数据
        };
    },
    computed:{
        selectPlaceholder(){
            return this.formItem.componentParams.placeholder||'请输入部门名称';
        }
    },
    watch:{
        "paths.orgApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            var _this=this;
            if(newValue){
                this.entityResource= context.buildResource(newValue);
                this.doSearch();
            }
        }
    },
    methods: {
        buildQueryOptions(params,keyword){
            var encodeKeyword=context.getMvueToolkit().utils.leapQueryValueEncode(keyword);
            var filters= `status eq 1 and (${this.getTitleField()} like '%${encodeKeyword}%')`;
            params.filters=filters;
        },
        buildSelectFields(){
            return `${this.getIdField()},${this.getTitleField()}`;
        },
        buildSelectFields(){
            return `${this.getIdField()},${this.getTitleField()}`;
        },
        getIdField:function(){
            return context.getConsts().org.idField;
        },
        getTitleField:function(){
            return context.getConsts().org.nameField;
        },
        //从选择列表选择数据确认后，反应到多选组件
        confirmSelect(){
            var selectRef=this.$refs.selectRef;
            var selectedIds=selectRef.selectedIds||[];
            var value=null;
            if(selectedIds.length>0){
                value=selectedIds;
            }
            if(!value){
                this.$Modal.info({
                    content:"未选择任何数据"
                });
                return;
            }
            this.entityResource.query({filters:`id in ${value.join(',')}`}).then(({data})=>{
                this.selectedItem=data;
                this.close();
            });
        }
    },
    components:{
        selectOrg:require('./org-select/select-org')
    }
}
</script>
<style lang="scss" scoped>

</style>


