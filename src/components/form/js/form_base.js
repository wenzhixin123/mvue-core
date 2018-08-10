import metabase from '../../../libs/metadata/metabase';
import constants from './constants';
import metaformUtils from './metaform_utils';
import  metaservice from '../../../services/meta/metaservice';

var co = require('co');
export default{
    props:{
        "editToView":{
            type : Boolean,
            default: false
        }
    },
    data:function(){
        var entityName=this.$route.params.entityName||this.getEntityName();
        var metaEntity=metabase.findMetaEntity(entityName);
        var _model=metaEntity.getDefaultModel();
        this.fillDefaultByQuery(_model,metaEntity);
        var model=_.cloneDeep(_model);
        var dataResource=metaEntity.dataResource();
        return {
            navlist:[
                {
                    title:`${metaEntity.title}管理`,
                    to:{
                        path:metaEntity.viewPath(),
                        query:Utils.ignoreSpecialQuery(this.$route.query)
                    }
                },
                {title:`${this.$route.params.id?'编辑':'新建'}`}
            ],
            dataResource:dataResource,
            model:model,
            initialData:{},
            entityName:entityName,
            metaEntity:metaEntity,
            preprocessed: false,
            validator:null,
            /**
             * begin 存在表单元数据时，需要的数据定义
             */
            metaFormLayout:false,//true表示已经在控制台设计过表单，按设计过的表单显示表单
            metaForm:null,
            paths:constants.paths(),
            //begin 处理脚本相关data定义
            scriptModel:{
                formDataCreated:null,//(model)
                beforeSave:null,//(model)
                afterSave:null//(model)
            },
            //end 处理脚本相关data定义
            /**
             * end 存在表单元数据时，需要的数据定义
             */
            loadingFormData:false,//表示是否正在远程请求数据
            permissions:{
                "openEdit":false,
                "edit":false,
                "del":false,
                "cancel":false
            },
            subcomponentAfterSaveChain:[]//所有需要在表单保存后做继续操作的子组件集合
        };
    },
    mounted:function(){
        //编辑模式,从后台获取模型数据
        var _this=this;
        this.validator=this.$refs.form.$validator;
        //初始化表单相关逻辑
        this.initForm();
    },
    methods:{
        registerAfterSaveChain(subcomponent){
            this.subcomponentAfterSaveChain.push(subcomponent);
        },
        fillDefaultByQuery(_model,metaEntity){//创建模式时model用url参数填充
            var query=this.$route.query;
            _.forIn(query,function(value,key){
                let metaField=metaEntity.findField(key);
                if(metaField){
                    _model[key]=value;
                }
            });
        },
        getEditModelIfNeeded(){//如果是编辑模式，根据数据id或者表单数据model
            var _this=this;
            if(this.$route.params.id){
                this.loadingFormData=true;
                return this.dataResource.get({id:this.$route.params.id}).then(function({data}){
                    _this.loadingFormData=false;
                    if(_.isFunction(_this.initPerm)){
                        _this.initPerm(data);
                    }
                    _this.initialData=data;
                    if(_this.metaForm){//已经定义过表单，以表单定义字段为准初始化模型
                        let fields=metaformUtils.getAllFieldItems(_this.metaForm);
                        _.each(fields,function(field){
                            let key=field.dataField;
                            _this.model[key]=data[key];
                        });
                        _this.model[constants.entityModelRedundantKey]=data[constants.entityModelRedundantKey];
                    }else{//没有定义表单的情况下，使用默认实体表单字段
                        _.forIn(_this.model,function(value,key){
                            _this.model[key]=data[key];
                        });
                    }
                    return true;
                },function(){
                    _this.loadingFormData=false;
                });
            }else{
                this.permissions={
                    "openEdit":false,
                    "edit":true,
                    "del":true,
                    "cancel":true
                }
            }
            return true;
        },
        //表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
        exDataChanged:function(newValue,dataField){
            metaformUtils.exDataChanged(this.model,newValue,dataField);
        },
        gotoViewList(){
            var path=this.metaEntity.viewPath();
            router.push({
                path:path,
                query:{
                    formShortId:this.$route.query.formShortId,
                    viewShortId:this.$route.query.viewShortId
                }
            });
        },
        onCreated(){
            //this.gotoViewList();
            router.go(-1);
        },
        onEdited(){
            if(this.editToView){//如果需要从编辑页保存数据后，跳转回查看页
                let _query=_.extend({},this.$route.query);
                _query[Utils.queryKeys.action]=Utils.formActions.view;
                router.push({
                    name:this.$route.name,
                    params:this.$route.params,
                    query:_query
                });
            }
        },
        onDeleted(){
            this.gotoViewList();
        },
        setEntityName(entityName){
            this._entityName=entityName;
            return {entityName:entityName};
        },
        getEntityName(){
            return this._entityName;
        },
        initForm(){
            var formShortId=this.$route.query.formShortId;
            if(!formShortId){
                this.preprocessed=true;
                this.initDefault();
                return;
            }
            var _this = this;
            metaservice().getFormByShortId({id:formShortId,resolve:true})
                .then(({ data }) => {
                    //存在自定义表单，按表单元数据构建表单
                    _this.metaFormLayout=true;
                    _this.metaForm=data;
                    let res=_this.getEditModelIfNeeded();
                    if(res&&res.then){
                        res.then(function(){
                            _this.formDataCreated();
                            _this.metaFormToForm(data);
                        });
                    }else{
                        _this.formDataCreated();
                        _this.metaFormToForm(data);
                    }
                },(resp)=>{
                    _this.initDefault();
                });
        },
        initDefault(){
            var _this=this;
            let res=_this.getEditModelIfNeeded();
            if(res&&res.then){
                res.then(function(){
                    _this.preprocessed=true;
                });
            }else{
                _this.preprocessed=true;
            }
        },
        /**
         * begin 存在表单元数据时，转换成表单的方法逻辑定义
         */
        //实体已经在控制台定义过表单，由表单元数据生成表单
        metaFormToForm(metaForm){
            var _this=this;
            //初始化表单验证
            var formItems=metaformUtils.getAllFieldItems(metaForm);
            _.each(formItems,function(formItem){
                metaformUtils.initValidation(_this.validator,formItem,_this.metaEntity,_this.$route.params.id);
            });
            //执行表单脚本
            this.handleFormScript(metaForm);
            this.handleFieldOptionsToggle();
            this.preprocessed=true;
        },
        //begin 处理脚本
        handleFormScript(metaForm){
            var logistics=metaForm.logistics;
            if(logistics.script){
                let fun= new Function(logistics.script);
                fun.call(this);
            }
        },
        setValue(fieldName,newValue){//设置fieldName字段的值为newValue
            this.model[fieldName]=newValue;
        },
        getValue(fieldName){//获取fieldName字段的值
            return this.model[fieldName];
        },
        showField(fieldName){//显示fieldName字段
            var formItem=metaformUtils.formItemByFieldName(this.metaForm,fieldName);
            if(formItem){
                formItem.hidden=false;
            }
        },
        hideField(fieldName){//隐藏fieldName字段
            var formItem=metaformUtils.formItemByFieldName(this.metaForm,fieldName);
            if(formItem){
                formItem.hidden=true;
            }
        },
        formDataCreated(){//表单数据初始化后
            if(this.scriptModel&&_.isFunction(this.scriptModel.formDataCreated)){
                this.scriptModel.formDataCreated.call(this,this.model);
            }
        },
        beforeSave(){//表单数据提交前
            if(this.scriptModel&&_.isFunction(this.scriptModel.beforeSave)){
                return this.scriptModel.beforeSave.call(this,this.model);
            }
            return true;
        },
        afterSave(data){//表单数据提交后
            let result=true;
            if(this.scriptModel&&_.isFunction(this.scriptModel.afterSave)){
                result=this.scriptModel.afterSave.call(this,data);
            }
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
        //end 处理脚本
        //begin 处理选择某个选项时，显示和隐藏某些组件逻辑
        handleFieldOptionsToggle:function(){//处理选择某个选项时，显示和隐藏某些组件逻辑
            var logistics=this.metaForm.logistics;
            var _this=this;
            if(logistics.optionsToggleComponentsConfig){
                //遍历每一个单选项配置的逻辑
                _.forIn(logistics.optionsToggleComponentsConfig,function(value,key){
                    let curFormItem=metaformUtils.getFormItemById(_this.metaForm,key);
                    //如果此单选项组件存在
                    if(curFormItem){
                        //选项要控制的组件集合
                        let toggleFields=value.toggleFields;
                        let dataFields=metaFormUtils.getAllFieldItems(_this.metaForm);
                        _.each(dataFields,function(fi,index){
                            if(_.includes(toggleFields,fi.id)){
                                fi.hidden=true;
                            }
                        });
                        //监听单选项的值变化，从而显示和隐藏其他组件
                        _this.$watch('formData.'+curFormItem.dataField,function(newV,oldV){
                            //选项特殊的可切换字段
                            let visibleFields=value.toggleSetting[newV];
                            if(visibleFields){
                                _.each(dataFields,function(fi,index){
                                    if(fi.id===curFormItem.id){
                                        fi.hidden=false;
                                    }else if((!_.includes(visibleFields,fi.id))&&_.includes(toggleFields,fi.id)){
                                        fi.hidden=true;
                                    }else{
                                        fi.hidden=false;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        },
        //end 处理选择某个选项时，显示和隐藏某些组件逻辑
        /**
         * begin 存在表单元数据时，转换成表单的方法逻辑定义
         */
    }
}