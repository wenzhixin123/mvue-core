<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div v-text="viewModeValue"></div>
        </template>
        <template v-else>
            <div class="bvue-select-wrapper bvue-select-group bvue-select-with-append">
                <Multiselect v-model="selectedItem"
                            :options="dataItems"
                            :placeholder="formItem.componentParams.placeholder||'请输入关键字搜索'"
                            :loading="isLoading"
                            :disabled="disabled"
                            select-label="按enter键选择"
                            selected-label="已选"
                            deselect-label="按enter键取消选择"
                            :show-no-results="true"
                            :internal-search="false"
                            :label="getTitleField()"
                            @search-change="searchChange"
                            :track-by="getIdField()">
                    <template slot="option" slot-scope="props">
                        <div class="option__desc">
                            <span class="option__title">{{ props.option[formItem.componentParams.titleField] }}</span>
                        </div>
                    </template>
                    <template slot="noResult">
                        根据关键字，搜索不到任何数据
                    </template>
                    <template slot="noOptions">
                        无数据
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
                        <ref-entity-select ref="selectRef" v-if="popupWidgetModal"
                            :form-item="formItem"
                            :value="selectedItem"
                        ></ref-entity-select>
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
import selectModel from '../mixins/select-modal';
export default {
    mixins: [controlBase,entitySelect,selectModel],
    props: {
        "value":{type:[String,Number],default:null}
    },
    data: function(){
        var entityResource=null;
        if(this.formItem.componentParams&&this.formItem.componentParams.entityResourceUrl){
            entityResource= context.buildResource(this.formItem.componentParams.entityResourceUrl);
        }
        return {
            selectedItem:null,//已经选择的项
            entityResource:entityResource//获取实体数据的操作resource
        };
    },
    methods: {
        buildQueryOptions(params,keyword){
            debugger;
            var encodeKeyword=context.getMvueToolkit().utils.leapQueryValueEncode(keyword);
            var filters=`${this.getTitleField()} like '%${encodeKeyword}%'`;
            params.filters=filters;
            if(this.formItem.componentParams.orderbyField){
                let orderbyType=this.formItem.componentParams.orderbyType||'asc';
                params.orderby=`${this.formItem.componentParams.orderbyField} ${orderbyType}`;
            }
        },
        searchChange:function(keyword){
            debugger;
            this.doSearch(keyword);
        },
        getIdField:function(){
            return this.formItem.componentParams.idField;
        },
        getTitleField:function(){
            return this.formItem.componentParams.titleField;
        },
        //从选择列表选择数据确认后，反应到多选组件
        confirmSelect(){
            var selectedItem=this.$refs.selectRef.selectedItem;
            if(!selectedItem){
                this.$Modal.info({
                    content:"请选择一行数据"
                });
                return;
            }
            this.selectedItem=selectedItem;
            this.close();
        }
    },
    components:{
        refEntitySelect:require('./ref-entity-select')
    }
}
</script>



