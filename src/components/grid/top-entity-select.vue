<template>
    <Multiselect v-if="entityResource" style="display:inline-block;width:200px;float:right;"
        :multiple="false" v-model="selectedItem"
        :options="dataItems"
        :placeholder="placeholder"
        :loading="isLoading"
        select-label="按enter键选择"
        selected-label="已选"
        deselect-label="按enter键取消选择"
        :show-no-results="true"
        :internal-search="false"
        :label="getTitleField()"
        @search-change="searchChange"
        @input="handleOnChange"
        :track-by="getIdField()">
        <template slot="option" slot-scope="props">
            <div class="option__desc">
                <span class="option__title">{{ props.option[getTitleField()] }}</span>
            </div>
        </template>
        <template slot="noResult">
            根据关键字，搜索不到任何数据
        </template>
        <template slot="noOptions">
            无数据
        </template>
    </Multiselect>
</template>
<script>
import context from '../../libs/context';
import metabase from '../../libs/metadata/metabase';
import entitySelect from '../form/mixins/entity-select';
export default {
    mixins:[entitySelect],
    props:{
        entityName:{
            type:String,
            required:true
        },
        searchFields:{
            type:Array,
            default(){
                return [];
            }
        },
        queryOptions:{
            type:Object,
            default(){
                return {};
            }
        },
        placeholder:{
            type:String,
            default:''
        }
    },
    data(){
        var metaEntity = metabase.findMetaEntity(this.entityName);
        var entityResource=metaEntity.dataResource();
        return {
            metaEntity:metaEntity,
            entityResource:entityResource,
            changedQueue:[]
        };
    },
    methods:{
        getIdField(){
            return this.metaEntity.getIdField().name;
        },
        getTitleField(){
            return this.metaEntity.firstTitleField().name;
        },
        buildQueryOptions(params,keyword){
            var encodeKeyword=context.getMvueToolkit().utils.leapQueryValueEncode(keyword);
            var filters=`${this.getTitleField()} like '%${encodeKeyword}%'`;
            if(this.searchFields&&this.searchFields.length>0){
                let _f=[];
                this.searchFields.forEach(sf => {
                    _f.push(`${sf} like '%${encodeKeyword}%'`);
                });
                filters=_f.join(' and ');
            }
            if(this.queryOptions){
                for (const key in this.queryOptions) {
                    if (this.queryOptions.hasOwnProperty(key)) {
                        const element = this.queryOptions[key];
                        //filters作拼接
                        if(key=='filters'&&element){
                            filters=`(${this.queryOptions.filters}) and (${filters})`;
                        }else{//其他queryOptions直接覆盖
                            params[key]=element;
                        }
                    }
                }
            }
            params.filters=filters;
        },
        handleOnChange(){
            let topEntityRow='';
            if(this.selectedItem){
                let idFieldName=this.getIdField();
                topEntityRow=`${this.entityName}/${this.selectedItem[idFieldName]}`;
            }
            this.$store.commit('core/setTopEntityRow',topEntityRow);
        }
    }
}
</script>

