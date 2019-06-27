<template>
    <div id="grid-quick-search-con">
        <div class="layout_l" style="padding-left: 0px;padding-right: 0px;">
                <div class="field" v-if="isKey">
                    <div class="form-group">
                        <label class="ivu-form-item-label key_label">关键字</label>
                        <input type="text" class="form-control" placeholder="请输入关键字搜索" v-model="innerQuicksearchKeyword">
                    </div>
                </div>
                <meta-field class="field" v-for="key in advanceSearchFields" :key="key" :name="key" v-model="model[key]" :entity-name="entityName" :input-type="inputType(key)">
                </meta-field>
                <div class="field" v-if="!layout2">
                    <Button type="primary" @click="doSearch">搜索</Button>
                    <Button type="ghost" @click="doReset">重置</Button>
                </div>
        </div>
        <div class="layout_r">
            <div v-if="layout2">
                <Button type="primary" @click="doSearch">搜索</Button>
                <Button type="ghost" @click="doReset">重置</Button>
            </div>
        </div>
    </div>
</template>
<script>
    import controlTypeService from '../form/js/control_type_service';
    import utils from '../../libs/utils';
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
            quicksearchKeyword:{
                type:String
            },
            isKey:{
                type:Boolean,
                default:true
            }
        },
        data:function(){
            var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            var _model={};
            _.each(this.advanceSearchFields,f=>{
                _model[f]=null;
        });
            return {
                searchModal:false,
                model:_model,
                innerAdvanceSearchFilters:_.cloneDeep(this.value),
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
                return null;
            },
            advanceSearch(){
                this.searchModal=!this.searchModal;
            },
            doReset(){
                _.each(this.advanceSearchFields,f=>{
                    this.model[f]=null;
            });
                this.innerQuicksearchKeyword="";
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
                            let _value=utils.leapQueryValueEncode(value);
                            advanceSearchFilters.push({
                                key:key,
                                op:"like",
                                value:`'%${_value}%'`
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
                this.$emit("do-quick-search",advanceSearchFilters,this.innerQuicksearchKeyword);
                this.searchModal=false;
            }
        },
        computed:{
            "layout2"(){
              //布局方式
              return (this.advanceSearchFields.length + (this.isKey?1:0))%3 == 0;
            }
        }
    }
</script>

<style lang="less">
    #grid-quick-search-con{
        padding: 15px 5px 0;
        border: 1px #f1f1f1 solid;
        display: flex;
        .key_label{ padding-top: 7px;}
        .layout_l{ flex: 3;
            display: flex;
            .form-group{ display: flex;}
            label{display: inline-block; width: 100px !important; text-align: center;}
            .field{ width: 30% !important; display: inline-block; margin-right: 2%;}
            .form-control{ display: inline-block;}
        }
        .layout_r{ /*flex: 1*/ width:140px;}
    }
</style>

