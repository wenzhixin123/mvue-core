<style lang="scss">
    @import "../components.scss";
</style>
<template>
    <Form v-if="preprocessed" :ref="'formRef'" :model="entity"
          :rules="innerRules" :inline="inline" :label-position="labelPosition" :label-width="labelWidth"
          :show-message="showMessage" :autocomplete="autocomplete">
        <slot>
            <meta-field v-for="key in metaEntity.getDefaultFormFields()" :key="key" :name="key">
            </meta-field>
        </slot>
        <FormItem v-if="hasButtons() || $slots.toolbar" class="form-toolbar"
                v-transfer-dom="'#default-form-uuid-'+entityName" :data-transfer="transfer">
            <slot name="toolbar" >
                <template v-if="isView">
                    <meta-operation v-for="btn in toolbar.viewBtns" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button :type="btn.btnType || 'primary'"  :title="btn.title">
                            <Icon :type="btn.icon" v-if="btn.icon"></Icon>
                            {{btn.title}}
                        </Button>
                    </meta-operation>
                </template>
                <template v-if="!isView">
                    <meta-operation v-for="btn in toolbar.editBtns" :key="btn.name" :operation="btn" :widget-context="getWidgetContext()">
                        <Button :type="btn.btnType || 'primary'"  :title="btn.title">
                            <Icon :type="btn.icon" v-if="btn.icon"></Icon>
                            {{btn.title}}
                        </Button>
                    </meta-operation>
                </template>
            </slot>
        </FormItem>
    </Form>
</template>
<script>
    import TransferDom from './js/transfer_dom';
    import constants from './js/constants';
    import metaformUtils from './js/metaform_utils';
    import metaservice from '../../services/meta/metaservice';
    import  contextHelper from "../../libs/context";
    import controlTypeService from './js/control_type_service';
    import widgetMode from './js/widget-mode';

    import initByMetadata from './init-by-metadata';

    var co = require('co');

    export default {
        directives: { TransferDom },
        props:{
            toolbar:{
                type: Object,
                require: false
            },
            entityName:{//必填参数，表示元数据实体的名称）
                type:String,
                required:true
            },
            recordId:{ //当前表单编辑的实体数据id，这个属性只在组件初始化时使用，作为创建还是编辑表单的依据，后续实体数据id，通过entityId获取
                type:String,
                required:false,
            },
            forceView:{                                 //表示是否指定表单未强制查看模式
                type:Boolean,
                default:false
            },
            editToView:{                        //编辑完成后，是否跳转到查看页面
                type : Boolean,
                default: false
            },
            onInited:{
                type:Function,
            },
            onSubmit:{
                type:Function
            },
            onSaved:{
                type:Function
            },
            permissions:{//控制按钮的权限
                type:Object,
                require:false,
                default:function(){
                    return {
                        openEdit:false,//开启编辑按钮权限
                        edit:true,//修改或者保存按钮权限
                        del:true,//删除按钮权限
                        cancel:true//取消按钮
                    };
                }
            },
            transfer: {
                type: Boolean,
                default: false
            },
            fieldSettings:{//表单字段配置数据，控制字段的显示和编辑状态
                type: Object,
                require: false
            },
            checkArchived:{//表示是否开启表单的归档检测，默认不开启
                type:Boolean,
                default:false
            },
            rules:{
                type:Object,
                default:function () {
                    return {};
                }
            },
            inline:{
                type:Boolean,
                default:false
            },
            labelPosition:{
                type:String,
                default:"right",
            },
            labelWidth:{
                type:Number
            },
            showMessage:{
                type:Boolean,
                default:true
            },
            autocomplete:{
                type:String,
                default:"off"
            },
            gutter:{
                type:Number,
                default:24
            }
        },
        computed:{
            isCreate:function () {
                return !this.isView && this.formStatus==contextHelper.getMvueToolkit().utils.formActions.create;
            },
            isEdit:function () {
                return !this.isView && this.formStatus==contextHelper.getMvueToolkit().utils.formActions.edit;
            },
            isView:function(){//是否为查看模式
                //外部指定强制查看模式或者已归档
                if(this.forceView||this.isArchived){
                    return true;
                }
                return false;
            }
        },
        data:function(){
            var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            var dataResource=metaEntity.dataResource();
            var formStatus=contextHelper.getMvueToolkit().utils.formActions.create;
            if(!_.isEmpty(this.recordId)){
                formStatus=contextHelper.getMvueToolkit().utils.formActions.edit;
            }
            //构造实体数据操作的基本数据模型，会包含需要提交到后台的所有字段：会过滤掉主键、创建时间等维护字段
            //这里提前初始化entity数据，保证字段的存在性，对于双向绑定和表单验证是必须的
            var entity=metaEntity.getDefaultModel();
            return {
                isArchived:false,//表示数据是否已归档
                dataResource:dataResource,
                changedQueue:[],//智能验证变化队列
                formStatus:formStatus,
                metaEntity:metaEntity,
                entity:entity,
                entityId:this.recordId,
                isMetaForm:true,
                openEditClicked:false,
                innerPermissions:_.cloneDeep(this.permissions),
                isSavingToServer:false,//表示是否正在保存数据到服务器，用来处理保存时触发重复提交数据
                formActions:contextHelper.getMvueToolkit().utils.formActions,
                preprocessed: false,
                paths:constants.paths(),
                subcomponentAfterSaveChain:[],//所有需要在表单保存后做继续操作的子组件集合
                innerRules:_.cloneDeep(this.rules)
            };
        },
        watch:{
            permissions:{
                handler:function(){
                    this.innerPermissions=_.cloneDeep(this.permissions);
                },
                deep:true
            }
        },
        mounted:function () {
            //创建模式，继续初始化，因为初始模型数据已经存在了
            if(this.isCreate){
                //如果url参数是实体的字段则填充相应的模型数据
                initByMetadata.initModelByQueryParams(this,this.entity);
                this.initOthers();
            }else{//编辑或查看模式，需要从后端获取实体记录数据覆盖初始的模型数据，之后再继续初始化
                this.reinitEntityModel();
            }
        },
        methods:{
            initOthers(){
                //根据实体字段信息初始化表单默认验证规则
                this.initValidateRulesByMetaEntity();
                //预处理完毕，表单可以渲染了
                this.preprocessed=true;
                //调用外部传入的初始化回调函数
                if(this.onInited){
                    this.onInited(this);
                }
            },
            //根据数据id重新初始化entity模型数据
            reinitEntityModel(){
                return this.dataResource.get({id: this.entityId}).then(({data})=> {
                    //根据实体记录数据初始化操作权限
                    this.initPerm(data);
                    _.forIn(this.entity, (value, key) => {
                        this.entity[key] = data[key];
                    });
                    this.initOthers();
                });
            },
            //根据实体字段信息初始化表单默认验证规则
            initValidateRulesByMetaEntity:function () {
                var _this=this;
                _.forEach(_this.metaEntity.getDefaultFormFields(),function (fieldName) {
                    var metaField=_this.metaEntity.findField(fieldName);
                    var formItem=controlTypeService.buildFormItemByMetaField(metaField);
                    var rules=metaformUtils.initValidation(formItem,_this.metaEntity,_this.entityId);
                    if(rules.length>0) {
                        _this.innerRules[formItem.dataField] = rules;
                    }
                });
            },
            //表单操作需要的上下文数据
            getWidgetContext(){
                return {
                    selectedId: this.entityId,
                    selectedItem: this.entity,
                    metaEntity: this.metaEntity,
                    form : this
                };
            },
            //表单的默认保存操作为调用表单示例的doSaveModel保存实体数据
            doSaveModel:function(){
                var _this=this;
                return new Promise((resolve,reject)=>{
                    this.$refs["formRef"].validate(valid=>{
                        if(valid){
                            let before=_this.beforeSave();
                            if (before && before.then){//返回的Promise对象
                                before.then(function(valid){
                                    if(false!==valid){//true 表示可继续保存
                                        let doSavePromise=_this.doSave();
                                        doSavePromise.then((data)=>{resolve(data);},()=>{reject();});
                                    }else{
                                        reject();
                                    }
                                });
                            }else if(before!==false){//普通true or false
                                let doSavePromise=_this.doSave();
                                doSavePromise.then((data)=>{resolve(data);},()=>{reject();});
                            }else{
                                reject();
                            }
                        }else{
                            contextHelper.warning({title:"表单验证失败",content:"表单内部分字段验证未通过，请修复后再重新提交"});
                            reject();
                        }
                    });
                });
            },
            //表单提交前预处理，如果外部定义了onSubmit，执行onSubmit
            beforeSave(){
                var isContinue=true;
                if(this.onSubmit){
                    isContinue=_.defaultTo(this.onSubmit(this),true);
                }
                if(!isContinue){
                    return false;
                }
                return true;
            },
            //doSaveModel调用时，会先校验表单，然后执行外部定义的onSubmit如果成功再继续执行这里的doSave
            doSave(){
                var _this=this;
                if(_this.isSavingToServer){
                    return;
                }
                _this.isSavingToServer=true;
                return new Promise((resolve,reject)=>{
                    if(this.isEdit){//更新
                        let _model=this.ignoreReadonlyFields();
                        _this.dataResource.update({id:this.entityId},_model).then(function({data}){
                            _this.isSavingToServer=false;
                            let afterSavePromise=_this.afterSave("on-edited",data,'编辑成功');
                            afterSavePromise.then(()=>{resolve(_this.entity);},()=>{reject();});
                        },function(){
                            _this.isSavingToServer=false;
                            reject();
                        });
                    }else{//新建
                        let _model=this.ignoreReadonlyFields();
                        _this.dataResource.save(_model).then(function({data}){
                            _this.entityId=data[_this.metaEntity.getIdField().name];
                            //创建完数据后，立即为编辑模式否则可能产生多保存数据
                            _this.formStatus=contextHelper.getMvueToolkit().utils.formActions.edit;
                            _this.isSavingToServer=false;
                            let afterSavePromise=_this.afterSave("on-created",data,'保存成功');
                            afterSavePromise.then(()=>{
                                resolve(data);
                            },()=>{reject();});
                        },function(){
                            _this.isSavingToServer=false;
                            reject();
                        });
                    }
                });
            },
            //表单数据提交完成后调用：如果与表单关联的组件也需要作一些事情在这里处理
            afterSave(evtName,data,msg){
                let _this=this;
                //调用内部组件保存事件
                let after=_this.afterSaveChain(data);
                return new Promise((resolve,reject)=>{
                    //抛出保存事件
                    if (after && after.then){//返回的Promise对象
                        after.then(function(valid){
                            if(false!==valid){//true 表示可继续保存
                                _this.$emit(evtName,data);
                                _this.onCompleted(msg);
                                resolve();
                            }else{
                                reject();
                            }
                        });
                    }else if(after!==false){
                        _this.$emit(evtName,data);
                        _this.onCompleted(msg);
                        resolve();
                    }else{
                        reject();
                    }
                });
            },
            //串行执行与表单关联的组件的后处理逻辑
            afterSaveChain(data){
                let result=true;
                //如果子组件在保存后需要做自己的保存操作，在这里进行
                //注意这里使用了generator函数(function*)和co库，保证子组件afterSave一个一个串行执行，如果出错不会往下执行，直接返回结果
                let subcomponentAfterSaveChain=this.subcomponentAfterSaveChain;
                if(!_.isEmpty(subcomponentAfterSaveChain)){
                    function* nextAfterSave(){
                        for(let i=0;i<subcomponentAfterSaveChain.length;++i){
                            let subcomponent=subcomponentAfterSaveChain[i];
                            if(subcomponent&&_.isFunction(subcomponent.afterSave)){
                                yield new Promise(function (resolve, reject){
                                    let res=subcomponent.afterSave(data);
                                    if(res&&res.then){
                                        res.then(function(valid){
                                            if(false!==valid){
                                                resolve();
                                            }else{
                                                reject();
                                            }
                                        });
                                    }else if(false!==res){
                                        resolve();
                                    }else{
                                        reject();
                                    }
                                });
                            }
                        }
                    }
                    result = co(nextAfterSave);
                }
                return result;
            },
            //注册与表单关联的组件的后处理逻辑
            registerAfterSaveChain(subcomponent){
                this.subcomponentAfterSaveChain.push(subcomponent);
            },
            //表单数据提交完，并且关联子组件的数据处理逻辑也完成后执行
            //1 执行外部定义的onSaved回调，后续步骤可以在onSaved中返回false阻止继续执行
            //2 根据msg参数弹出成功提示
            //3 editToView为true：表示需要从编辑页保存数据后，跳转回查看页，否则返回上一页
            onCompleted(msg){
                var isContinue=true;
                if(this.onSaved){
                    isContinue=_.defaultTo(this.onSaved(this),true);
                }
                if(!isContinue){
                    return false;
                }
                if(msg){
                    contextHelper.success(msg);
                }
                if(this.editToView){//如果需要从编辑页保存数据后，跳转回查看页
                    let _query=_.extend({},this.$route.query);
                    _query[contextHelper.getMvueToolkit().utils.queryKeys.action]=contextHelper.getMvueToolkit().utils.formActions.view;
                    contextHelper.getRouter().push({
                        name:this.$route.name,
                        params:this.$route.params,
                        query:_query
                    });
                }else{
                    contextHelper.getRouter().go(-1);
                }
            },
            //表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
            //这个方法会在metafield组件内部触发
            exDataChanged:function(newValue,dataField){
                metaformUtils.exDataChanged(this.entity,newValue,dataField);
            },
            //工具栏是否有按钮存在，没有按钮的话，工具栏隐藏
            hasButtons(){
                if(!this.toolbar){
                    return false;
                }
                if(this.toolbar&&_.isEmpty(this.toolbar.viewBtns)&&this.isView){
                    return false;
                }
                if(this.toolbar&&_.isEmpty(this.toolbar.editBtns)&&!this.isView){
                    return false;
                }
                if(this.innerPermissions.cancel){
                    return true;
                }
                if(this.innerPermissions.openEdit&&this.isView){
                    return true;
                }
                if(!this.entityId||(this.innerPermissions.edit&&!this.isView)){
                    return true;
                }
                if(this.entityId&&this.innerPermissions.del&&!this.isView){
                    return true;
                }
                return false;
            },
            //对entity数据作筛选，忽略readonly的字段，以便向后端提交数据
            ignoreReadonlyFields(){
                let _model={};
                let _this=this;
                _.forIn(_this.entity,function(v,k){
                    let metaField=_this.metaEntity.findField(k);
                    if(metaField&&metaField.readonly){
                        //readonly字段不提交
                    }else{
                        _model[k]=v;
                    }
                });
                return _model;
            },
            //TODO: 判断是否归档的逻辑可能需要修正
            checkIsArchived() {
                var _self = this;
                metaservice().getSuiteDataSetting({id: _self.entityId}).then(({data}) => {
                    _self.isArchived=true;
                    if(eventBus&&eventBus.record){
                        eventBus.record.isArchived = true;
                    }
                    _self.innerPermissions={
                        openEdit:false,
                        edit:false,
                        del:false,
                        cancel:false
                    }
                }).catch(()=> {
                    _self.isArchived=false;
                    if(eventBus&&eventBus.record){
                        eventBus.record.isArchived = false;
                    }
                });
            },
            //初始化表单数据操作权限
            initPerm(data){
                this.innerPermissions={
                    "openEdit":contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField],contextHelper.getMvueToolkit().utils.permValues.edit),
                    "edit":contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField],contextHelper.getMvueToolkit().utils.permValues.edit),
                    "del":contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField],contextHelper.getMvueToolkit().utils.permValues.del),
                    "cancel":true
                };
                if(this.checkArchived){
                    this.checkIsArchived();
                }
            },
            //通用操作删除按钮执行删除后的回调，在metagrid_operation.js中会调用
            onDeleted(){
                this.gotoViewList();
            },
            //返回到实体数据列表
            gotoViewList(){
                var path=this.metaEntity.viewPath();
                contextHelper.getRouter().push({
                    path:path
                });
            }
        }
    }
</script>


