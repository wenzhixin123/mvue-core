import TransferDom from './js/transfer_dom';
import constants from './js/constants';
import widgetMode from './js/widget-mode';
import contextHelper from "../../libs/context";
import globalConsts from "../../libs/consts";
import cartesian from "../../libs/cartesian";
import operationManager from "../../libs/operation/operations";
import getParent from '../mixins/get-parent';
import entityResource from "../../libs/metadata/entity-resource";
import consts from "../../libs/consts";
var co = require('co');
export default {
    mixins:[getParent],
    directives: { TransferDom },
    props:{
        toolbar:{
            type: Object,
            require: false
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
        completedAction:{//可选值：closePopup（关闭对话框）、editToView(编辑完跳转到查看页)和自定义函数(与onSaved属性作用相同)
            type:[String,Function],
            required:false
        },
        batchForm:{//{fields:["orgId"]}，如果指定fields，将根据这个字段将原字段对应的引用实体组件变成多选引用实体组件，并生成多条数据保存
            type:Object,
            default(){
                return {fields:[]};
            }
        },
        saveOpts:{//{url:"xxx/{:id}",batchUrl:"user/batch",createAnother:true}
            type:Object,
            default(){
                return {createAnother:false};
            }
        },
        emptyText:{
            type:String,
            default:'--'
        },
        localModel:{//默认情况下，编辑模式会通过recordId远程获取实体数据，但是指定了localModel参数后，将使用localModel代替远程数据初始化表单模型
            type:Object
        },
        forceViewWhenDeny:{//是否在表单数据没有编辑权限时，自动修改为forceView查看模式
            type:Boolean,
            default:false
        },
        defaultValues: {//新建时，设置固定默认值
            type: Object,
            require: false
        },
        calc: {//后端不提供calc接口，可设置calc为false，这样表单控件就不会调用calc接口获取默认值
            type: Boolean,
            default:true
        }
    },
    data(){
        var formStatus=contextHelper.getMvueToolkit().utils.formActions.create;
        var entityId=this.recordId;
        if(!!entityId||(entityId===0)){
            formStatus=contextHelper.getMvueToolkit().utils.formActions.edit;
        }
        return {
            metaEntity:null,
            entity:{},
            dataResource:null,
            isArchived:false,//表示数据是否已归档
            changedQueue:[],//智能验证变化队列
            formStatus:formStatus,
            entityId:entityId,
            isMetaForm:true,
            openEditClicked:false,
            isSavingToServer:false,//表示是否正在保存数据到服务器，用来处理保存时触发重复提交数据
            formActions:contextHelper.getMvueToolkit().utils.formActions,
            preprocessed: false,
            paths:constants.paths(),
            subcomponentAfterSaveChain:[],//所有需要在表单保存后做继续操作的子组件集合
            innerRules:_.cloneDeep(this.rules),
            innerToolbar:{
                editBtns:this.wrapBtns(this.toolbar&&this.toolbar.editBtns,formStatus),
                viewBtns:this.wrapBtns(this.toolbar&&this.toolbar.viewBtns,formStatus)
            },
            createAnother:false,//是否继续创建模式
            hasEditPerm:true,//是否有编辑权限
            ignoreKeys:{}//保存从服务端获取的entity数据中，不是当前实体字段的冗余数据key
        };
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
            //指定没有编辑权限时，自动改为forceView查看模式
            if(this.forceViewWhenDeny){
                if(!this.hasEditPerm){
                    return true;
                }
            }
            if(this.$route.action=="view"){
                return true;
            }
            return false;
        },
        toolbarTransferDomId(){
            var popup=this.getParentPopup();
            if(popup){
                return `#${popup.footerDomId}`
            }else{
                return `#default-form-uuid-${this.entityName}`;
            }
        },
        itemLabelWidth(){
            if(this.labelPosition=="top"){
                return this.labelWidth;
            }
            if(typeof this.labelWidth=="undefined" || this.labelWidth==null){
                return 120;
            }
            return this.labelWidth;
        }
    },
    methods: {
        //表单操作需要的上下文数据
        getWidgetContext() {
            let context= {
                selectedId: this.entityId,
                selectedItem: this.entity,
                metaEntity: this.metaEntity,
                form: this
            };
            let _self=this;
            Object.defineProperty(context,"parentItem", {
                get: function () {
                    return _self.getParentRecord();
                },
                enumerable: true
            });
            return context;
        },
        getParentRecord(){
            let oneToManyRelation=this.resolveParentRelation();
            if(oneToManyRelation==null){
                return null;
            }
            let refEntity=this.$store.state.core.currentRouteData[oneToManyRelation.entity.toLowerCase()];
            if(refEntity){
                return Promise.resolve(refEntity);
            }
            let refId=oneToManyRelation.refFieldId;
            let targetMetaEntity=this.$metaBase.findMetaEntity(oneToManyRelation.entity);
            return entityResource.find(oneToManyRelation.entity,refId).then((data)=>{
                return  data;
            });
        },
        resolveParentRelation(){
            let matched=null;
            //优先从query中解析父实体信息
            _.forIn(this.$route.query,(val,field)=>{
                let metaField=this.metaEntity.findField(field);
                if(metaField==null || metaField.manyToOneRelation==null){
                    return ;
                }
                matched={
                    entity:metaField.manyToOneRelation.targetEntity,
                    refFieldId:val
                }
            });
            if(matched!=null){
                return matched;
            }
            _.forEach(this.metaEntity.relations,relation=>{
                if(relation.type!=consts.manyToOne){
                    return ;
                }
                let targetMetaEntity=relation.targetEntity;
                let parentEntity=this.$store.state.core.currentRouteData[targetMetaEntity.name.toLowerCase()];
                if(parentEntity!=null){
                    matched={
                        entity:targetMetaEntity
                    }
                    return false;
                }
            });
        },
        //表单的默认保存操作为调用表单示例的doSaveModel保存实体数据
        doSaveModel: function () {
            var _this = this;
            return new Promise((resolve, reject) => {
                this.$refs["formRef"].validate(valid => {
                    if (valid) {
                        let before = _this.beforeSave();
                        if (before && before.then) {//返回的Promise对象
                            before.then(function (valid) {
                                if (false !== valid) {//true 表示可继续保存
                                    let doSavePromise = _this.doSave();
                                    doSavePromise.then((data) => {
                                        resolve(data);
                                    }, () => {
                                        reject();
                                    });
                                } else {
                                    reject();
                                }
                            });
                        } else if (before !== false) {//普通true or false
                            let doSavePromise = _this.doSave();
                            doSavePromise.then((data) => {
                                resolve(data);
                            }, () => {
                                reject();
                            });
                        } else {
                            reject();
                        }
                    } else {
                        this.$Message.error({
                            content: "表单内部分字段验证未通过，请修复后再重新提交",
                            duration: 2.5,
                            closable: true
                        });
                        //contextHelper.warning({title: "表单验证失败", content: "表单内部分字段验证未通过，请修复后再重新提交"});
                        reject();
                    }
                });
            });
        },
        //表单提交前预处理，如果外部定义了onSubmit，执行onSubmit
        beforeSave() {
            var isContinue = true;
            if (this.onSubmit) {
                isContinue = _.defaultTo(this.onSubmit(this), true);
            }
            if (!isContinue) {
                return false;
            }
            return isContinue;
        },
        //doSaveModel调用时，会先校验表单，然后执行外部定义的onSubmit如果成功再继续执行这里的doSave
        doSave() {
            var _this = this;
            if (_this.isSavingToServer) {
                return;
            }
            _this.isSavingToServer = true;
            return new Promise((resolve, reject) => {
                if (this.isEdit) {//更新
                    let _model = this.ignoreReadonlyFields();
                    let _resource = _this.dataResource;
                    let method="update";
                    if (this.saveOpts.url) {
                        const baseServiceRoot = contextHelper.getConfig(globalConsts.base_service);
                        _resource = contextHelper.buildResource(this.saveOpts.url, null, {root: baseServiceRoot});
                        if("patch"==this.saveOpts.method){
                            method="update";
                        }else{
                            method="save"
                        }
                    }
                    _resource[method]({id: this.entityId}, _model).then(function ({data}) {
                        _this.isSavingToServer = false;
                        let afterSavePromise = _this.afterSave("on-edited", data, '编辑成功');
                        afterSavePromise.then(() => {
                            resolve({data: _this.entity});
                        }, (err) => {
                            reject(err);
                        });
                    }, function (err) {
                        _this.isSavingToServer = false;
                        reject(err);
                    });
                } else {//新建
                    let _model = this.ignoreReadonlyFields();
                    if (this.isBatchMode()) {
                        let _batchModel = this.buildBatchModel(_model);
                        if (_.isEmpty(_batchModel)) {
                            reject();
                            return;
                        }
                        this.batchSave(_batchModel)
                            .then((data) => {
                                this.isSavingToServer = false;
                                //如果需要继续创建数据，则根据设置的resetFields作清理（恢复默认值）
                                if (this.createAnother) {
                                    if (!_.isEmpty(this.saveOpts.resetFields)) {
                                        var entity = this.metaEntity.getDefaultModel();
                                        _.each(this.saveOpts.resetFields, f => {
                                            if (_.includes(this.batchForm.fields, f)) {
                                                this.entity[this.getBatchFieldProp(f)] = [];
                                            } else {
                                                this.entity[f] = entity[f];
                                            }
                                        });
                                    }
                                    this.$Modal.success({title: "创建数据提示", content: `已批量创建[${data.length}]条新数据，可继续创建`});
                                }
                                let _data = [];
                                _.each(data, d => {
                                    _data.push(d.data);
                                });
                                let afterSavePromise = _this.afterSave("on-created", _data, this.createAnother ? '' : '保存成功');
                                afterSavePromise.then(() => {
                                    resolve({data: _data, isCreate: true, createAnother: this.createAnother});
                                }, () => {
                                    reject();
                                });
                            })
                            .catch(() => {
                                this.isSavingToServer = false;
                                reject();
                            });
                    } else {
                        this.singleSave(_model).then(({data}) => {
                            //如果需要继续创建数据，则根据设置的resetFields作清理（恢复默认值）
                            if (this.createAnother) {
                                if (!_.isEmpty(this.saveOpts.resetFields)) {
                                    var entity = this.metaEntity.getDefaultModel();
                                    _.each(this.saveOpts.resetFields, f => {
                                        this.entity[f] = entity[f];
                                    });
                                }
                                this.$Modal.success({title: "创建数据提示", content: `已创建一条新数据，可继续创建`});
                            } else {
                                _this.entityId = data[_this.metaEntity.getIdField().name];
                                //创建完数据后，立即为编辑模式否则可能产生多保存数据
                                _this.formStatus = contextHelper.getMvueToolkit().utils.formActions.edit;
                            }
                            let afterSavePromise = _this.afterSave("on-created", data, this.createAnother ? '' : '保存成功');
                            afterSavePromise.then(() => {
                                resolve({data: data, isCreate: true, createAnother: this.createAnother});
                            }, () => {
                                reject();
                            });
                        }, () => {
                            _this.isSavingToServer = false;
                            reject();
                        });
                    }
                }
            });
        },
        batchSave(_batchModel) {
            const baseServiceRoot = contextHelper.getConfig(globalConsts.base_service);
            if (this.saveOpts.batchUrl) {
                return this.$http.post(this.saveOpts.batchUrl, _batchModel, {baseURL: baseServiceRoot});
            } else {
                let batchAllPromises = [];
                _.each(_batchModel, m => {
                    batchAllPromises.push(this.singleSave(m));
                });
                return Promise.all(batchAllPromises);
            }
        },
        singleSave(_model) {
            const baseServiceRoot = contextHelper.getConfig(globalConsts.base_service);
            if (this.saveOpts.url) {
                return this.$http.post(this.saveOpts.url, _model, {baseURL: baseServiceRoot});
            } else {
                return this.dataResource.save(_model);
            }
        },
        //表单数据提交完成后调用：如果与表单关联的组件也需要作一些事情在这里处理
        afterSave(evtName, data, msg) {
            let _this = this;
            //调用内部组件保存事件
            let after = _this.afterSaveChain(data);
            return new Promise((resolve, reject) => {
                //抛出保存事件
                if (after && after.then) {//返回的Promise对象
                    after.then(function (valid) {
                        if (false !== valid) {//true 表示可继续保存
                            _this.$emit(evtName, data);
                            _this.onCompleted(msg);
                            resolve();
                        } else {
                            reject();
                        }
                    });
                } else if (after !== false) {
                    _this.$emit(evtName, data);
                    _this.onCompleted(msg);
                    resolve();
                } else {
                    reject();
                }
            });
        },
        //串行执行与表单关联的组件的后处理逻辑
        afterSaveChain(data) {
            let result = true;
            //如果子组件在保存后需要做自己的保存操作，在这里进行
            //注意这里使用了generator函数(function*)和co库，保证子组件afterSave一个一个串行执行，如果出错不会往下执行，直接返回结果
            let subcomponentAfterSaveChain = this.subcomponentAfterSaveChain;
            if (!_.isEmpty(subcomponentAfterSaveChain)) {
                function* nextAfterSave() {
                    for (let i = 0; i < subcomponentAfterSaveChain.length; ++i) {
                        let subcomponent = subcomponentAfterSaveChain[i];
                        if (subcomponent && _.isFunction(subcomponent.afterSave)) {
                            yield new Promise(function (resolve, reject) {
                                let res = subcomponent.afterSave(data);
                                if (res && res.then) {
                                    res.then(function (valid) {
                                        if (false !== valid) {
                                            resolve();
                                        } else {
                                            reject();
                                        }
                                    });
                                } else if (false !== res) {
                                    resolve();
                                } else {
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
        registerAfterSaveChain(subcomponent) {
            this.subcomponentAfterSaveChain.push(subcomponent);
        },
        //表单数据提交完，并且关联子组件的数据处理逻辑也完成后执行
        //1 执行外部定义的onSaved回调，后续步骤可以在onSaved中返回false阻止继续执行
        //2 根据msg参数弹出成功提示
        //3 editToView为true：表示需要从编辑页保存数据后，跳转回查看页，否则返回上一页
        onCompleted(msg) {
            var isContinue = true;
            if (this.onSaved) {
                isContinue = _.defaultTo(this.onSaved(this), true);
            }
            if (_.isFunction(this.completedAction)) {
                isContinue = _.defaultTo(this.completedAction(this), true);
            }
            if (!isContinue) {
                return false;
            }
            if (msg) {
                contextHelper.success(msg);
            }
            if (this.editToView || this.completedAction == "editToView") {//如果需要从编辑页保存数据后，跳转回查看页
                let _query = _.extend({}, this.$route.query);
                _query[contextHelper.getMvueToolkit().utils.queryKeys.action] = contextHelper.getMvueToolkit().utils.formActions.view;
                contextHelper.getRouter().push({
                    name: this.$route.name,
                    params: this.$route.params,
                    query: _query
                });
            }
        },
        //工具栏是否有按钮存在，没有按钮的话，工具栏隐藏
        hasButtons() {
            if (!this.toolbar) {
                return false;
            }
            if (this.toolbar && _.isEmpty(this.toolbar.viewBtns) && this.isView) {
                return false;
            }
            if (this.toolbar && _.isEmpty(this.toolbar.editBtns) && !this.isView) {
                return false;
            }
            return true;
        },
        //对entity数据作筛选，忽略readonly的字段，以便向后端提交数据
        ignoreReadonlyFields() {
            let _model = {};
            let _this = this;
            _.forIn(_this.entity, (v, k) => {
                if(this.ignoreKeys[k]){
                    return;
                }
                let metaField = _this.metaEntity.findField(k);
                if(!metaField){
                    _model[k] = v;
                    return;
                }
                if(metaField.readonly){
                    return;
                }
                //创建模式，如果字段creatable为false，不提交此字段
                if (this.isCreate && (!metaField.creatable)) {
                    return;
                }
                //编辑模式，如果字段updatable为false，不提交此字段
                if (this.isEdit && (!metaField.updatable)) {
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
        //TODO: 判断是否归档的逻辑可能需要修正
        checkIsArchived() {
            var _self = this;
            metaservice().getSuiteDataSetting({id: _self.entityId}).then(({data}) => {
                _self.isArchived = true;
                if (eventBus && eventBus.record) {
                    eventBus.record.isArchived = true;
                }
                _self.innerPermissions = {
                    openEdit: false,
                    edit: false,
                    del: false,
                    cancel: false
                }
            }).catch(() => {
                _self.isArchived = false;
                if (eventBus && eventBus.record) {
                    eventBus.record.isArchived = false;
                }
            });
        },
        //初始化表单数据操作权限
        initPerm(data) {
            this.innerPermissions = {
                "openEdit": contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField], contextHelper.getMvueToolkit().utils.permValues.edit),
                "edit": contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField], contextHelper.getMvueToolkit().utils.permValues.edit),
                "del": contextHelper.getMvueToolkit().utils.hasPerm(data[contextHelper.getMvueToolkit().utils.dataPermField], contextHelper.getMvueToolkit().utils.permValues.del),
                "cancel": true
            };
            if (this.checkArchived) {
                this.checkIsArchived();
            }
        },
        //通用操作删除按钮执行删除后的回调，在metagrid_operation.js中会调用
        onDeleted() {
            this.gotoViewList();
        },
        //返回到实体数据列表
        gotoViewList() {
            var path = this.metaEntity.viewPath();
            contextHelper.getRouter().push({
                path: path
            });
        },
        //传递给表单组件的context，可以控制表单组件的显示状态
        fieldContext(item) {
            //字段视图
            let _obj = {
                metaEntity: this.metaEntity,
                mode: null,
                isCreate: this.isCreate
            };
            //外部指定强制查看模式或者已归档
            if (this.isView) {
                //目前强制查看模式和readonly都统一
                _obj.mode = widgetMode.forceView;
            } else if (item && this.fieldSettings && this.fieldSettings[item.dataField]) {
                //存在对字段的状态设置
                let mode = this.fieldSettings[item.dataField].mode;
                //隐藏字段在这里做，进入组件里边隐藏可能不起作用
                if (widgetMode.invisible === mode) {
                    item.hidden = true;
                }
                _obj.mode = mode;
            }
            return _obj;
        },
        //判断按钮是否禁用
        btnIsDisabled(btn) {
            //btn 写了disabled:true
            if (btn.disabled === true) {
                return true;
            } else if (_.isFunction(btn.disabled)) {
                var ctx = {
                    isForm: true,
                    entity: this.entity
                };
                return btn.disabled(ctx);
            }
            return false;
        },
        //判断按钮是否显示
        btnIsHidden(btn) {
            //btn 写了hidden:true
            if (btn.hidden === true) {
                return true;
            } else if (_.isFunction(btn.hidden)) {
                var ctx = {
                    isForm: true,
                    entity: this.entity
                };
                return btn.hidden(ctx);
            }
            return false;
        },
        batchFieldConvert(item) {
            //只有创建模式才支持multiDataField属性，做转换
            if (this.isBatchMode() && _.includes(this.batchForm.fields, item.name)) {
                item.propName = this.getBatchFieldProp(item.name);
                item.batchField = true;
            }
        },
        isBatchMode() {
            if (!this.batchForm.fields) {
                return false;
            }
            return this.isCreate && (!_.isEmpty(this.batchForm.fields));
        },
        getBatchFieldProp(fieldName) {
            return `${fieldName}_multidata`;
        },
        buildBatchModel(_initialModel) {
            var initialModel = _.cloneDeep(_initialModel);
            var obj = {};
            _.each(this.batchForm.fields, f => {
                var batchFieldName = this.getBatchFieldProp(f);
                obj[f] = cartesian.alt.apply(null, initialModel[batchFieldName]);
                delete initialModel[batchFieldName];
                delete initialModel[f];
            });
            var batchModel = cartesian.expand(obj);
            _.each(batchModel, bm => {
                bm = _.extend(bm, initialModel);
            });
            return batchModel;
        },
        showCreateAnother() {
            if (!this.innerToolbar) {
                return false;
            }
            if (!this.innerToolbar.editBtns) {
                return false;
            }
            var has = false;
            _.each(this.innerToolbar.editBtns, btn => {
                if (btn.name == "save") {
                    has = true;
                    return false;
                }
            });
            return this.isCreate && has && this.saveOpts.createAnother;
        },
        wrapBtns(btns,formStatus) {
            var ops = {
                beforeCreate: function (opt) {
                    if (opt.name == "save"
                        && formStatus == contextHelper.getMvueToolkit().utils.formActions.edit
                        && _.isEmpty(opt.security)) {
                        opt.security = ["update"];
                    }
                    return opt;
                }
            }
            if (this["entityName"]) {
                ops["entityName"] = this["entityName"]
            }
            var wrapped= operationManager.batchCreate(btns, ops);
            return wrapped;
        }
    }
}
