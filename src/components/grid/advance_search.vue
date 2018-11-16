<template>
    <div class="grid-advance-search-con">
        <div v-if="toolbarType=='compact'" @click="advanceSearch" class="concat-toolbar-btn"><Icon type="funnel"></Icon>高级</div>
        <Button v-else @click="advanceSearch" type="default"><Icon type="funnel"></Icon>高级搜索</Button>
        <Modal
                v-model="searchModal"
                title="高级筛选"  ok-text="搜索" cancel-text="重置"
                @on-ok="doSearch"
                @on-cancel="doReset">
            <Form ref="advanceSearchForm" :model="model">
                <FormItem label="关键字" v-if="quicksearch&&quicksearch.fields">
                    <Input v-model="innerQuicksearchKeyword" :placeholder="quicksearch.placeholder"></Input>
                </FormItem>
                <m-field v-for="key in advanceSearchFields" :model="model" :key="key" :name="key" :entity-name="entityName" :input-type="inputType(key)">
                </m-field>
            </Form>
        </Modal>
    </div>
</template>
<script>
import controlTypeService from '../form/js/control_type_service';
export default {
    props: {
        "entityName": {
            type: String,
            required: true
        },
        "advanceSearchFields":{
            type:Array,
            require:true
        },
        quicksearch:{
            type:Object,
        },
        quicksearchKeyword:{
            type:String
        },
        "toolbarType": {//'compact':紧凑型toolbar布局；不设置用默认toolbar布局
            type: String,
            required: false
        },
        initModel:{//初始查询条件
            type:Object
        }
    },
    data:function(){
        var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
        var _model={};
        //如果外部传入了vuex存入的初始查询model，替换之
        if(this.initModel){
            _model=_.cloneDeep(this.initModel);
        }else{
            _.each(this.advanceSearchFields,f=>{
                _model[f]=null;
            });
        }
        return {
            searchModal:false,
            model:_model,
            metaEntity:metaEntity,
            innerQuicksearchKeyword:this.quicksearchKeyword
        }
    },
    watch:{
        quicksearchKeyword:function(){
            this.innerQuicksearchKeyword=this.quicksearchKeyword;
        }
    },
    methods:{
        inputType(key){
            var metaField=this.metaEntity.findField(key);
            if(metaField.inputType===controlTypeService.componentTypes.DateTime.id){
                return controlTypeService.componentTypes.DateTimeRange.id;
            }else if(metaField.inputType===controlTypeService.componentTypes.Date.id){
                return controlTypeService.componentTypes.DateRange.id;
            }else if(metaField.inputType===controlTypeService.componentTypes.Time.id){
                return controlTypeService.componentTypes.TimeRange.id;
            }
            return metaField.inputType;
        },
        advanceSearch(){
            this.searchModal=!this.searchModal;
        },
        doReset(){
            _.each(this.advanceSearchFields,f=>{
                this.model[f]=null;
            });
            this.innerQuicksearchKeyword="";
            this.doSearch();
        },
        cancel(){
            this.searchModal=false;
        },
        doSearch(){
            var advanceSearchFilters=[];
            var _this=this;
            _.forIn(this.model,function(value,key){
                if(!_.isNull(value)&&value!==""&&!_.isUndefined(value)){
                    let metaField=_this.metaEntity.findField(key);
                    if(metaField.inputType==controlTypeService.componentTypes.MultiLineText.id
                        ||metaField.inputType==controlTypeService.componentTypes.SingleLineText.id
                    ){
                        advanceSearchFilters.push({
                            key:key,
                            op:"like",
                            value:`%${value}%`
                        });
                    }else if(metaField.inputType==controlTypeService.componentTypes.DateTime.id
                        ||metaField.inputType==controlTypeService.componentTypes.Date.id){
                        //对于日期自动转成范围查询
                        advanceSearchFilters.push({
                            key:key,
                            op:"ge",
                            value:value[0]
                        });
                        advanceSearchFilters.push({
                            key:key,
                            op:"le",
                            value:value[1]
                        });
                    }else{
                        advanceSearchFilters.push({
                            key:key,
                            op:"eq",
                            value:value
                        });
                    }
                }
            });
            this.$emit("do-advance-search",advanceSearchFilters,this.innerQuicksearchKeyword);
            this.searchModal=false;
        }
    }
}
</script>

<style lang="less" scoped>
.grid-advance-search-con{
    display:inline-block;
    margin-right: 4px;
}
</style>

