<template>
    <div class="grid-advance-search-con">
        <div v-if="toolbarType=='compact'" @click="advanceSearch" class="concat-toolbar-btn"><Icon type="funnel"></Icon>高级</div>
        <Button v-else @click="advanceSearch" type="default"><Icon type="funnel"></Icon>高级搜索</Button>
        <Modal :width="modalWidth"
                v-model="searchModal"
                title="高级筛选"  ok-text="搜索" cancel-text="重置"
                @on-ok="doSearch"
                @on-cancel="doReset">
            <Form ref="advanceSearchForm" 
                :style="{height:modalHeight+'px',overflow:'auto'}"
                :model="model" 
                label-position="right" 
                :label-width="120">
                <Row>
                    <i-col span="24">
                        <FormItem label="关键字" v-if="quicksearch&&quicksearch.fields">
                            <Input v-model="innerQuicksearchKeyword" :placeholder="quicksearch.placeholder"></Input>
                        </FormItem>
                    </i-col>
                </Row>
                <m-layout :layout="layout"></m-layout>
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
        },
        queryOptions:{//grid的queryOptions
            type:Object
        },
        modalWidth:{
            type:Number,
            default:60
        },
        modalHeight:{
            type:Number,
            default(){
                if(!document.documentElement){
                    return 400;
                }
                let clientHeight=document.documentElement.clientHeight-160;
                return clientHeight>0?clientHeight:400;
            }
        }
    },
    data:function(){
        var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
        var _model={};
        //如果外部传入了vuex存入的初始查询model，替换之
        if(this.initModel){
            _model=_.cloneDeep(this.initModel);
        }
        let defaultJoins=this.getGridDefaultJoins();
        let allSearchFields=[];
        let joinMapping={};
        let layout=this.preprocess(this.advanceSearchFields,joinMapping,_model,allSearchFields,defaultJoins);
        return {
            searchModal:false,
            model:_model,
            metaEntity:metaEntity,
            innerQuicksearchKeyword:this.quicksearchKeyword,
            joinMapping:joinMapping,
            defaultJoins:defaultJoins,
            allSearchFields:allSearchFields,
            layout:layout
        }
    },
    watch:{
        quicksearchKeyword:function(){
            this.innerQuicksearchKeyword=this.quicksearchKeyword;
        }
    },
    methods:{
        inputType(key,metaEntity){
            let mapping={};
            //日期时间都转成时间范围查询
            mapping[controlTypeService.componentTypes.DateTime.id]=controlTypeService.componentTypes.DateTimeRange.id;
            mapping[controlTypeService.componentTypes.Date.id]=controlTypeService.componentTypes.DateRange.id;
            mapping[controlTypeService.componentTypes.Time.id]=controlTypeService.componentTypes.TimeRange.id;
            //单选框都变成多选框，用in查询
            let multiSelectId=controlTypeService.componentTypes.MultiSelect.id;
            mapping[controlTypeService.componentTypes.RadioButton.id]=multiSelectId;
            mapping[controlTypeService.componentTypes.SingleSelect.id]=multiSelectId;

            var metaField=metaEntity.findField(key);
            if(mapping[metaField.inputType]){
                return mapping[metaField.inputType];
            }
            return metaField.inputType;
        },
        advanceSearch(){
            this.searchModal=!this.searchModal;
        },
        doReset(){
            _.each(this.allSearchFields,f=>{
                this.model[f]=null;
            });
            this.innerQuicksearchKeyword="";
            this.doSearch();
        },
        cancel(){
            this.searchModal=false;
        },
        addFilters(key,value,inputType,advanceSearchFilters){
            //文本类型查询条件用like
            let textMapping={};
            textMapping[controlTypeService.componentTypes.MultiLineText.id]=true;
            textMapping[controlTypeService.componentTypes.SingleLineText.id]=true;
            //日期时间类型查询条件用范围
            let dateMapping={};
            dateMapping[controlTypeService.componentTypes.DateTime.id]=true;
            dateMapping[controlTypeService.componentTypes.Date.id]=true;
            dateMapping[controlTypeService.componentTypes.Time.id]=true;
            //单选项类型查询条件用in
            let multiSelectMapping={};
            multiSelectMapping[controlTypeService.componentTypes.RadioButton.id]=true;
            multiSelectMapping[controlTypeService.componentTypes.SingleSelect.id]=true;

            if(textMapping[inputType]){
                advanceSearchFilters.push({
                    key:key,
                    op:"like",
                    value:`%${value}%`
                });
            }else if(dateMapping[inputType]){
                //对于日期自动转成范围查询
                advanceSearchFilters.push({
                    key:key+'1',
                    mappingKey:key,
                    op:"ge",
                    value:value[0]
                });
                advanceSearchFilters.push({
                    key:key+'2',
                    mappingKey:key,
                    op:"le",
                    value:value[1]
                });
            }else if(multiSelectMapping[inputType]){
                if(!_.isEmpty(value)){
                    advanceSearchFilters.push({
                        key:key,
                        op:"in",
                        value:value
                    });
                }
            }else{
                advanceSearchFilters.push({
                    key:key,
                    op:"eq",
                    value:value
                });
            }
        },
        getGridDefaultJoins(){
            if(this.queryOptions&&this.queryOptions.joins){
                let defaultJoins=this.queryOptions.joins;
                let defaultJoinsArray=defaultJoins.split(',');
                let defaultJoinsMap={};
                _.forEach(defaultJoinsArray,dj=>{
                    let djArray=dj.split(' ');
                    let key=djArray[0],value=djArray[1];
                    defaultJoinsMap[key]=value;
                });
                return defaultJoinsMap;
            }
            return {};
        },
        doSearch(){
            var advanceSearchFilters=[];
            let _joins={};
            _.forIn(this.model,(value,key)=>{
                if(this.joinMapping[key]){//关系字段join
                    let joinMapping=this.joinMapping[key];
                    if(!_.isNull(value)&&value!==""&&!_.isUndefined(value)){
                        _joins[joinMapping.relationName]=joinMapping;
                        let inputType=joinMapping.metaEntity.findField(joinMapping.fieldName).inputType;
                        this.addFilters(`${joinMapping.alias}.${joinMapping.fieldName}`,value,inputType,advanceSearchFilters);
                    }
                }else if(!_.isNull(value)&&value!==""&&!_.isUndefined(value)){//当前实体字段构成的查询条件
                    let inputType=this.metaEntity.findField(key).inputType;
                    this.addFilters(key,value,inputType,advanceSearchFilters);
                }
            });
            let joinsArray=[],joins=null;
            if(!_.isEmpty(_joins)){
                _.forIn(_joins,(v,k)=>{
                    //如果grid的queryOptions定义了同样的join这里不再添加
                    if(!this.defaultJoins[k]){
                        joinsArray.push(`${k} ${k}`);
                    }
                });
                if(!_.isEmpty(joinsArray)){
                    joins=joinsArray.join(',');
                }
            }
            this.$emit("do-advance-search",advanceSearchFilters,this.innerQuicksearchKeyword,joins);
            this.searchModal=false;
        },
        preprocess(_layout,_joinMapping,_model,allSearchFields,defaultJoins){
            var processedSettings=[];
            _.forEach(_layout,(rowItem)=>{
                if(!_.isArray(rowItem)){
                    var component=this.processItem(rowItem,_joinMapping,_model,allSearchFields,defaultJoins);
                    processedSettings.push(component);
                    return;
                }
                var row=[];
                processedSettings.push(row);
                _.forEach(rowItem,(colItem)=>{
                    if(_.isArray(colItem)){
                        row.push(this.preprocess(colItem,_joinMapping,_model,allSearchFields,defaultJoins));
                        return ;
                    }
                    var component=this.processItem(colItem,_joinMapping,_model,allSearchFields,defaultJoins);
                    row.push(component);
                });
            });
            return processedSettings;
        },
        processItem:function(item,_joinMapping,_model,allSearchFields,defaultJoins){
            //处理["name","title"]写法的字段布局
            let _item=null;
            if(_.isString(item)){
                _item = {
                    name:item
                }
            }else{
                if(_.has(item,"value")){
                    item["name"]=item["value"];
                    delete item["value"];
                }
                _item=item;
            }
            _item.ctype='m-field';
            let asf=_item.name;
            var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            //关系字段用join
            if(asf.indexOf('.')>0){
                let names=asf.split('.');
                let expandField=names[0], refField=names[1];
                let metaField=metaEntity.findField(expandField);
                let relation=null;
                if(!metaField){
                    let relations=metaEntity.relations;
                    relation=relations[expandField];
                }else{
                    relation=metaField.manyToOneRelation;
                }
                if(relation){
                    let targeMetaEntity=this.$metaBase.findMetaEntity(relation.targetEntity);
                    let _key=asf.replace('.','-');
                    _model[_key]=null;
                    //解析出来的字段加入到allSearchFields中
                    allSearchFields.push(_key);
                    let refMetaField=targeMetaEntity.findField(refField);
                    _item=_.extend({
                        title:`[${targeMetaEntity.title}]${refMetaField.title}`,
                        inputType:this.inputType(refField,targeMetaEntity)
                    },_item,{
                        key:_key,
                        entityName:relation.targetEntity,
                        name:refField
                    });
                    _joinMapping[_key]={
                        relationName:relation.name,
                        alias:defaultJoins[relation.name]||relation.name,
                        metaEntity:targeMetaEntity,
                        fieldName:refField
                    }
                }
            }else{//当前实体字段拼filters条件
                let mField=metaEntity.findField(asf);
                if(mField){
                    _model[asf]=null;
                    //解析出来的字段加入到allSearchFields中
                    allSearchFields.push(asf);
                    _item=_.extend({
                        inputType:this.inputType(asf,metaEntity)
                    },_item,{
                        key:asf,
                        entityName:this.entityName,
                        name:asf
                    });
                }
            }
            _item.ignoreAutoMode=true;
            _item.propName=_item.key;
            _item.model=_model;
            delete _item.key;
            return _item;
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

