<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div v-text="viewModeValue()"></div>
        </template>
        <template v-else>
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
            </Multiselect>
        </template>
    </div>
</template>
<script>
import context from '../../../libs/context';
import controlBase from '../js/control_base';
import entitySelect from '../mixins/entity-select';
export default {
    mixins: [controlBase,entitySelect],
    props: {
        "value":{type:String,default:null}
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
            var filters=`${this.getTitleField()} like '%${keyword}%'`;
            params.filters=filters;
            if(this.formItem.componentParams.orderbyField){
                let orderbyType=this.formItem.componentParams.orderbyType||'asc';
                params.orderby=`${this.formItem.componentParams.orderbyField} ${orderbyType}`;
            }
        },
        searchChange:function(keyword){
            this.doSearch(keyword);
        },
        getIdField:function(){
            return this.formItem.componentParams.idField;
        },
        getTitleField:function(){
            return this.formItem.componentParams.titleField;
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


