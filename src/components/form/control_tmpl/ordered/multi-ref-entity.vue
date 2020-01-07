<template>
    <div>
        <template v-if="viewMode">
            <div class="form-item-view" :title="realViewModeValue()||emptyText">
                <template v-for="(val,index) in multiRefDeletedValue()">
                    <span :key="index" :class="{'deleted-ref':val.deleted}" v-text="(index<multiRefDeletedValue().length-1)?(val.text+','):val.text"></span>
                </template>
            </div>
        </template>
        <template v-else-if="!hasReadPerm">
            <Input readonly type="text" :value="realViewModeValue()"></Input>
        </template>
        <template v-else>
            <ordered-ref 
                :form-item="formItem"
                :context="context"
                :mode="mode"
                :disabled="disabled"
                v-model="innerValue">
            </ordered-ref>
        </template>
    </div>
</template>
<script>
import sc from '../../../../libs/security/permission';
import context from '../../../../libs/context';
import controlBase from '../../js/control_base';
import entitySelect from '../../mixins/entity-select';
export default {
    mixins: [controlBase,entitySelect],
    components:{
        orderedRef:require('./ordered-ref').default
    },
    props: {
        "value":{
            type:Array,
            default(){
                return [];
            }
        }
    },
    data(){
        var entityResource=null;
        if(this.formItem.componentParams&&this.formItem.componentParams.entityResourceUrl){
            entityResource= context.buildResource(this.formItem.componentParams.entityResourceUrl);
        }
        let hasReadPerm=sc.hasReadPerm(this.formItem.componentParams.entityId);
        return {
            innerValue:_.cloneDeep(this.value),
            hasReadPerm:hasReadPerm,
            selectedItem:[],//已经选择的项
            entityResource:entityResource//获取实体数据的操作resource
        };
    },
    watch:{
        value:{
            handler(){
                if(!_.isEqual(this.value,this.innerValue)){
                    this.innerValue=_.cloneDeep(this.value);
                }
            },
            deep:true
        },
        innerValue:{
            handler(){
                if(!_.isEqual(this.value,this.innerValue)){
                    this.$emit('input',_.cloneDeep(this.innerValue));
                }
            },
            deep:true
        }
    },
    methods: {
        buildQueryOptions(params,keyword){
            var encodeKeyword=context.getMvueToolkit().utils.leapQueryValueEncode(keyword);
            var filters=`${this.getTitleField()} like '%${encodeKeyword}%'`;
            params.filters=filters;
            if(this.formItem.componentParams.orderbyField){
                let orderbyType=this.formItem.componentParams.orderbyType||'asc';
                params.orderby=`${this.formItem.componentParams.orderbyField} ${orderbyType}`;
            }else{
                params.orderby=this.buildDefaultOrderBy();
            }
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


