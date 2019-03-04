<template>
    <div class="m-batch-editor">
        <m-form ref="form"
            :entity-name="entityName" 
            :record-id="currentRecordId" 
            :local-model="currentRow"
            @on-form-entity-changed="handleOnFormEntityChanged"
            >
            <m-grid ref="grid"
                :entity-name="entityName" 
                :toolbar="toolbar" 
                :columns="columns"
                :query="query"
                :query-options="queryOptions"
                pager="local"
                :page-size-opts="pageSizeOpts"
                :page-size="pageSize"
                :max-local-size="maxLocalSize"
                :show-row-status="true"
                :show-selection="false"
                :show-refresh-btn="false"
                :show-config-columns-btn="false"
                :status-column-fixed="statusColumnFixed"
                :operation-column-fixed="operationColumnFixed"
                :index-column-fixed="indexColumnFixed"
                :batch-editor-mode="true"
                :filters="filters"
                :default-sort="defaultSort"
                :external-local-pager-data="localListData&&localListData.data"
                @on-row-edit="handleOnRowEdit"
                @on-row-save="handleOnRowSave"
                @on-row-cancel-edit="handleOnRowCancelEdit"
                @on-batch-fill-data="handleOnBatchFillData"
                @on-row-click="handleOnRowClick"
                :handle-on-title-click="handleOnTitleClick"
                >
            </m-grid>
        </m-form>
        <Spin fix size="large" v-if="loading">
            <slot name="loading"></slot>
        </Spin>
    </div>
</template>
<script>
import globalContext from '../../libs/context';
const uuidv1 = require('uuid/v1');
var dayjs = require("dayjs");
export default {
    props:{
        entityName:{//当前批量编辑的实体名称
            type:String,
            required:true
        },
        columns:{
            type:Array,
            default:function(){
                return [];
            },
            required:true
        },
        queryUrl:{//外部指定的查询地址，必须是兼容leap查询协议的
            type:String,
            required:false
        },
        queryOptions:{//leap的固定查询参数
            type:Object,
            required:false
        },
        maxLocalSize:{
            type:Number,
            default:500
        },
        pageSize: {//每页条数
            type: Number,
            default: 50
        },
        pageSizeOpts: {
            type: Array,
            required: false,
            default: function () {
                return [50, 100];
            }
        },
        indexColumnFixed:{//指定索引列固定位置：left or right
            type:String,
            default:''
        },
        statusColumnFixed:{//指定编辑状态列固定位置：left or right
            type:String,
            default:''
        },
        operationColumnFixed:{//指定操作列固定位置：left or right
            type:String,
            default:''
        },
        quickSearch:{//快捷搜索配置{fields: null,placeholder: ""}
            type:Object,
            default(){
                return {fields: null,placeholder: ""};
            }
        },
        filters: {//高级查询的条件和列表头部的筛选条件设置
            type: Object
        },
        defaultSort: {//默认排序设置{key:'',order:'desc'}
            type: Object
        }
    },
    data(){
        let metaEntity=this.$metaBase.findMetaEntity(this.entityName);
        let idFieldName=metaEntity.getIdField().name;
        let self=this;
        //禁用所有列排序
        this.disableSortable();
        return {
            toolbar: {
                quicksearch:this.quickSearch,
                btnSizeBeforeMore:2,
                btns:[
                    {
                        name:"saveAll",
                        title:"全部保存",
                        icon:"ios-document-outline",
                        operationType:"script",
                        btnType:"primary",
                        onclick:function(){
                            self.loading=true;
                            self.saveAll();
                        }
                    },
                    {   
                        name:"fillAll",
                        title:"批量设值",
                        icon:"md-create",
                        operationType:"common",
                        btnType:"primary",
                        renderComponent:"m-batch-editor-fill-data"
                    }
                ],
                singleBtns: ["openEdit","cancelEdit","saveRow"]
            },
            metaEntity:metaEntity,
            idFieldName:idFieldName,
            currentRecordId:'',
            currentRow:{},
            localListData:null,//{data:[],total:0}
            localDataMap:{},
            loading:false
        };
    },
    methods:{
        handleOnRowClick(row,index){
            let id=row[this.idFieldName];
            let realRow=this.$refs.grid.rowMap[id];
            if(this.currentRecordId===id){
                return;
            }
            this.$refs.grid.editRow=id;
            this.handleOnRowEdit(id,realRow);
        },
        disableSortable(){
            this.columns.forEach(col => {
                col.sortable=false
            });
        },
        handleOnBatchFillData(model,clearModel){
            let edited=false;
            for (const key in model) {
                if (model.hasOwnProperty(key)) {
                    const value = model[key];
                    let hasValue=null!==value;
                    if(_.isArray(value)){
                        hasValue=!_.isEmpty(value);
                    }
                    if(hasValue){
                        edited=true;
                        this.localListData.data.forEach(item => {
                            item[key]=value;
                            item.__rowStatus__='unsaved';
                        });
                    }
                }
            }
            for (const key in clearModel) {
                if (clearModel[key]===true) {
                    edited=true;
                    this.localListData.data.forEach(item => {
                        item[key]=null;
                        item.__rowStatus__='unsaved';
                    });
                }
            }
            if(edited){
                this.$refs.grid.editRow='';
                this.$refs.grid.reload();
            }
        },
        handleOnRowEdit(id,row){ 
            this.currentRow=row;
            this.currentRecordId=id;
        },
        handleOnRowCancelEdit(context){
            let form=this.$refs.form;
            form.$refs["formRef"].validate(valid => {
                if (valid) {
                    //恢复到查看模式
                    context.grid.editRow='';
                }else{
                    globalContext.warning({title: "表单验证失败", content: "表单内部分字段验证未通过，请修复"});
                }
            });
        },
        handleOnRowSave(context){
            let form=this.$refs.form;
            let id=this.currentRow[this.idFieldName];
            form.$refs["formRef"].validate(valid => {
                if (valid) {
                    this.singleSave(this.localDataMap[id]).then(()=>{
                        //恢复到查看模式
                        context.grid.editRow='';
                        this.currentRow.__rowStatus__='saved';
                    },()=>{
                        this.currentRow.__rowStatus__='failed';
                        this.localDataMap[id]['__rowStatus__']='failed';
                    });
                }else{
                    globalContext.warning({title: "表单验证失败", content: "表单内部分字段验证未通过，请修复"});
                }
            });
        },
        handleOnFormEntityChanged(entity){
            let formFields=this.buildFormFields();
            let changed=false;
            formFields.forEach(fieldName => {
                let newV=entity[fieldName];
                let oldV=this.currentRow[fieldName];
                //2019-02-21T05:46:50.000Z
                if(oldV&&_.isString(oldV)&&oldV.indexOf('T')===10&&oldV.endsWith('Z')){
                    let metaField=this.metaEntity.findField(fieldName);
                    if(metaField.inputType=="DateTime"){
                        let _d=dayjs(oldV);
                        oldV=_d.format('YYYY-MM-DD HH:mm:ss');
                    }
                }
                if(!_.isEqual(newV,oldV)){
                    changed=true;
                    return false;
                }
            });
            if(!changed){
                return;
            }
            let id=entity[this.idFieldName];
            //编辑后的form数据反映到grid
            _.forIn(entity, (value, key) => {
                this.currentRow[key] = entity[key];
                this.localDataMap[id][key]= entity[key];
            });
            this.currentRow.__rowStatus__='unsaved';
            this.localDataMap[id]['__rowStatus__']='unsaved';
        },
        handleOnTitleClick(){
            //什么都不做，批量编辑模式，标题点击不可跳转
        },
        filteredByQuicksearch(filtered,quicksearchKeyword,quicksearchFields){
            if(quicksearchKeyword){
                let _filtered=_.filter(filtered,item=>{
                    let ok=false;
                    _.forEach(quicksearchFields,sf => {
                        let value=item[sf];
                        let find=false;
                        if(_.isString(value)){
                            find=value.indexOf(quicksearchKeyword)>-1;
                        }else if(_.isNumber(value)){
                            value=value.toString();
                            find=value.indexOf(quicksearchKeyword)>-1;
                        }else{
                            try{
                                if(!value){
                                    return false;
                                }
                                value=JSON.stringify(value);
                                find=value.indexOf(quicksearchKeyword)>-1;
                            }catch(e){
                                return false;
                            }
                        }
                        if(find){
                            ok=true;
                            return false;
                        }
                    });
                    return ok;
                });
                return _filtered;
            }else{
                return filtered;
            }
        },
        query(ctx,queryResource){
            //分页数据只在第一次加载时获取全部，后续都在内存取值
            if(this.localListData&&(!ctx.localPagerSecondLoad)){
                let quicksearchFields=ctx.quicksearchFields;
                let quicksearchKeyword=ctx.quicksearchKeyword;
                //按照编辑状态对内存数据过滤
                let __rowStatus__=ctx.filters&&ctx.filters.rules&&ctx.filters.rules.__rowStatus__;
                let filtered=[];
                if(__rowStatus__&&__rowStatus__.value){
                    filtered=_.filter(this.localListData.data,item=>{
                        return item.__rowStatus__===__rowStatus__.value;
                    });
                    filtered=this.filteredByQuicksearch(filtered,quicksearchKeyword,quicksearchFields);
                }else{
                    filtered=this.filteredByQuicksearch(_.cloneDeep(this.localListData.data),quicksearchKeyword,quicksearchFields);
                }
                let _listData={
                    data:_.cloneDeep(filtered),
                    total:filtered.length
                };
                return Promise.resolve(_listData);
            }
            //外部指定了查询地址，由此地址构造查询resource
            let _resource=queryResource;
            if(this.queryUrl){
                _resource=globalContext.buildResource(this.queryUrl);
            }
            let refGrid=this.$refs.grid;
            //默认存在元数据情况下，肯定是存在实体的queryResource的，而且是leap的后台，使用leap转换器
            return globalContext.getMvueComponents().leapQueryConvertor.exec(_resource,ctx,(params)=>{
                refGrid.beforeQuery&&refGrid.beforeQuery(params);
            },(listData)=>{//{data:[],total:10}
                listData.data.forEach(item => {
                    let id=item[this.idFieldName];
                    //如果id不存在构造一个虚拟的id
                    if(!id&&(id!==0)){
                        item[this.idFieldName]=uuidv1();
                        //标记为虚拟id数据
                        item.__virtualId__=true;
                        item.__rowStatus__="unsaved";
                    }else{
                        item.__rowStatus__="saved";
                    }
                });
                this.localListData=_.cloneDeep(listData);
                this.localListData.data.forEach(item => {
                    this.localDataMap[item[this.idFieldName]]=item;
                });
            });
        },
        ignoreVirtualFields(_model){
            delete _model.perms;
            delete _model.__rowStatus__;
        },
        singleSave(item){
            return new Promise((resolve,reject)=>{
                let form=this.$refs.form;
                let resource=form.dataResource;
                let id=item[this.idFieldName];
                //通过虚拟id标记后以保存的数据，后续为更新
                if(item.hasOwnProperty('__id__')){
                    id=item.__id__;
                }
                //虚拟id数据，创建
                if(item.__virtualId__){
                    let _model=this.ignoreReadonlyFields(item,true);
                    this.ignoreVirtualFields(_model);
                    resource.save(_model).then(({data})=>{
                        //创建成功后将真实id复制到__id__属性中，并删除虚拟id标志__virtualId__
                        item.__id__=data[this.idFieldName];
                        delete item.__virtualId__;
                        item.__rowStatus__='saved';
                        resolve();
                    },()=>{
                        item.__rowStatus__='failed';
                        reject();
                    });
                }else if(item.__rowStatus__=='unsaved'){//更新
                    let _model=this.ignoreReadonlyFields(item,false);
                    this.ignoreVirtualFields(_model);
                    resource.update({id:id},_model).then(()=>{
                        item.__rowStatus__='saved';
                        resolve();
                    },()=>{
                        item.__rowStatus__='failed';
                        reject();
                    });
                }else{
                    resolve();
                }
            });
        },
        needSave(item){//判断item是否需要保存
            if(item.__virtualId__||item.__rowStatus__=='unsaved'){
                return true;
            }
            return false;
        },
        saveAll(){
            let localListData=this.localListData;
            let savePromises=[];
            for(let i=0;i<localListData.data.length;++i){
                let item=localListData.data[i];
                if(this.needSave(item)){
                    savePromises.push(this.singleSave(item))
                }
            }
            Promise.all(savePromises).then(()=>{
                this.loading=false;
                this.$refs.grid.editRow='';
                this.$refs.grid.reload();
            },()=>{
                this.loading=false;
            });
        },
         //对entity数据作筛选，忽略readonly的字段，以便向后端提交数据
        ignoreReadonlyFields(_entity,isCreate) {
            let _model = {};
            let _this = this;
            _.forIn(_entity, (v, k) => {
                let metaField = _this.metaEntity.findField(k);
                if(!metaField){
                    _model[k] = v;
                    return;
                }
                if(metaField.readonly){
                    return;
                }
                //创建模式，如果字段creatable为false，不提交此字段
                if (isCreate && (!metaField.creatable)) {
                    return;
                }
                //编辑模式，如果字段updatable为false，不提交此字段
                if (!isCreate && (!metaField.updatable)) {
                    return;
                }
                if (_.isNil(v) && metaField && metaField.required) {
                    //未赋值的必填字段，不提交
                    return;
                }
                _model[k] = v;
            });
            return _model;
        },
        buildFormFields(){
            let fields=[];
            this.columns.forEach(col => {
                if(this.metaEntity.findField(col.key)){
                    fields.push(col.key);
                }
            });
            return fields;
        },
    }
}
</script>
<style lang="less">
.m-batch-editor .ivu-table-cell{
    .ivu-form-item-label{
        display: none !important;
    }
    .ivu-form-item-content{
        margin-left:0px !important;
    }
    .ivu-form-item{
        margin-bottom:0px;
    }
}
</style>

