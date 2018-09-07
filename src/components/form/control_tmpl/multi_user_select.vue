<template>
    <div :style="{width:formItem.componentParams.width+'%'}">
        <template v-if="viewMode">
            <div class="form-item-view-con" v-if="isNotEmpty(selectedItem)">
                <div v-text="viewModeValue()"></div>
            </div>
        </template>
        <template v-else>
            <Multiselect :multiple="true" v-model="selectedItem"
                        :options="dataItems"
                        :placeholder="formItem.componentParams.placeholder||'请输入用户姓名'"
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
                        <span>-</span>
                        <span class="option__small">{{ props.option.email||props.option[getLoginField()] }}</span>
                    </div>
                </template>
            </Multiselect>
            <p class="colorGrey" v-show="formItem.componentParams.description" v-text="formItem.componentParams.description"></p>
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
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    data: function(){
        let entityResource=null;
        if(this.paths&&this.paths.userApiUrl){
            entityResource= context.buildResource(this.paths.userApiUrl);
        }
        return {
            selectedItem:[],//已经选择的项
            entityResource:entityResource,//获取用户数据的操作resource
            queryFields:this.buildSelectFields(),//查询的冗余数据
        };
    },
    watch:{
        "paths.userApiUrl":function(newValue,oldValue){//监听地址，一旦设置值，用户操作的resource就可以构造了
            if(newValue){
                this.entityResource= context.buildResource(newValue);
                this.doSearch();
            }
        }
    },
    methods: {
        buildQueryOptions(params,keyword){
            var filters= `status eq 1 and (${this.getTitleField()} like '%${keyword}%' or ${this.getLoginField()}  like '%${keyword}%')`;
            params.filters=filters;
        },
        searchChange:function(keyword){
            this.doSearch(keyword);
        },
        buildSelectFields(){
            return `${this.getIdField()},${this.getTitleField()},${this.getLoginField()},${context.getConsts().user.detailFields}`;
        },
        getIdField:function(){
            return context.getConsts().user.idField;
        },
        getTitleField:function(){
            return context.getConsts().user.nameField;
        },
        getLoginField(){
            return context.getConsts().user.loginField;
        }
    }
}
</script>
<style lang="scss" scoped>

</style>


