<template>
    <div class="grid-advance-search-con">
        <Button @click="advanceSearch" type="ghost">高级查询</Button>
        <Modal class="search-modal"
            v-model="searchModal"
            width="400"
            title="高级查询"
            :scrollable="true"
            >
            <div style="height:350px;overflow:scroll;padding:0px 10px;">
                <meta-field v-for="key in advanceSearchFields" :key="key" :name="key" v-model="model[key]" :entity-name="entityName" :input-type="inputType(key)">
                </meta-field>
            </div>
            <div slot="footer">
                <button type="button" class="ivu-btn ivu-btn-text ivu-btn-large" @click="doReset"><span>重置</span></button> 
                <button type="button" class="ivu-btn ivu-btn-text ivu-btn-large" @click="cancel"><span>取消</span></button> 
                <button type="button" class="ivu-btn ivu-btn-primary ivu-btn-large" @click="doSearch"><span>确定</span></button>
            </div>
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
        }
    },
    data:function(){
        var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
        return {
            searchModal:false,
            model:{},
            innerAdvanceSearchFilters:_.cloneDeep(this.value),
            metaEntity:metaEntity
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
            return null;
        },
        advanceSearch(){
            this.searchModal=true;
        },
        doReset(){
            this.model={};
        },
        cancel(){
            this.searchModal=false;
        },
        doSearch(){
            var advanceSearchFilters=[];
            var _this=this;
            _.each(this.model,function(value,key){
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
                            value:`'${value[0]}'`
                        });
                        advanceSearchFilters.push({
                            key:key,
                            op:"le",
                            value:`'${value[1]}'`
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
            this.$emit("do-advance-search",advanceSearchFilters);
            this.searchModal=false;
        }
    }
}
</script>

<style lang="less" scoped>
.grid-advance-search-con{
    display:inline-block;
}
</style>

