import metabase from '../../../libs/metadata/metabase';
import constants from './constants';
import metaformUtils from './metaform_utils';
export default{
    data:function(){
        var entityName=this.$route.params.entityName||this.getEntityName();
        var metaEntity=metabase.findMetaEntity(entityName);
        var _model=metaEntity.getDefaultModel();
        this.fillDefaultByQuery(_model,metaEntity);
        var model=_.cloneDeep(_model);
        return {
            dataResource:metaEntity.dataResource(),
            model:model,
            entityName:entityName,
            metaEntity:metaEntity,
            preprocessed: false,
            validator:null,
            paths:constants.paths
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
        fillDefaultByQuery(_model,metaEntity){//创建模式时model用url参数填充
            var query=this.$route.query;
            _.each(query,function(value,key){
                let metaField=metaEntity.findField(key);
                if(metaField){
                    _model[key]=value;
                }
            });
        },
        getEditModelIfNeeded(){//如果是编辑模式，根据数据id或者表单数据model
            var _this=this;
            if(this.$route.params.id){
                return this.dataResource.get({id:this.$route.params.id}).then(function({data}){
                    _.each(_this.model,function(value,key){
                        _this.model[key]=data[key];
                    });
                    return true;
                });
            }
            return true;
        },
        initForm(){
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
        //表单记录扩展数据填充，如选择用户之后用户名称存储、选项类型其他选项对应的填写值等
        exDataChanged:function(newValue,dataField){
            metaformUtils.exDataChanged(this.model,newValue,dataField);
        },
        gotoViewList(){
            var path=this.metaEntity.viewPath();
            router.push({
                path:path
            });
        },
        onCreated(){
            //this.gotoViewList();
            router.go(-1);
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
        }
    }
}