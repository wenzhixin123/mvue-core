import controlTypeService from './control_type_service';
import constants from './constants';
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        },
        mode:{//表单是否是设计模式或者正常的模式
            type:String,
            default:controlTypeService.controlMode.normal
        },
        validator:{
            type:Object
        },
        paths:{
            type:Object,
            default:function(){
                return {};
            }
        },
        model:{//表单的模型数据
            type:Object
        },
        context:{//与上下文相关的对象，{metaEntity:"元数据实体对象",mode:"字段显示模式：readonly/invisible/editable",formStatus:"create/edit"}
            type:Object
        }
    },
    data:function(){
        return {
            controlTypeService:controlTypeService
        };
    },
    mounted:function(){
        //设计模式不作处理
        if(this.designMode){
            return;
        }
        //创建模式时，组件默认值初始化：如果组件定义了默认值，调用具体组件的默认值初始化函数
        if(this.shouldInitDefault()&&this.initDefaultByType){
            this.initDefaultByType();
            return;
        }
        //用来将默认空值，填充到表单的formData中，否则无法验证
        if(!this.value&&this.value!==0&&this.value!==false){
            this.$emit('input',null);
        }else if(this.value&&this.value.length==0){
            this.$emit('input',[]);
        }
    },
    computed:{
        labelWidth:function(){
            let lwidth=this.formItem.componentParams.horizontalLayoutLabelWidth;
            return lwidth+"%";
        },
        controlWidth:function(){
            let lwidth=this.formItem.componentParams.horizontalLayoutLabelWidth;
            let rwidth=100-_.toInteger(lwidth);
            return rwidth+"%";
        },
        disabled:function(){
            return this.isReadonly();
        },
        viewMode(){//强制查看模式
            let mode= this.context&&this.context.mode;
            if(Utils.widgetMode.forceView===mode){
                return true;
            }
            return false;
        },
        designMode(){//设计模式
            return this.mode===controlTypeService.controlMode.design;
        }
    },
    methods:{
        buildExData(value){//构造组件需要保存的冗余数据
            var exData={};
            exData[constants.entityModelTitleKey]=value;
            return exData;
        },
        getExData(id){//编辑模式获取当前表单数据字段id的冗余数据
            if(!id){
                return null;
            }
            var _data=this.model&&this.model[constants.entityModelRedundantKey];
            _data=_data||{};
            _data= _data[this.formItem.dataField]||{};
            return _data[id]&&_data[id][constants.entityModelTitleKey];
        },
        isCreate(){//判断当前表单是否为新建模式
            if(this.context
                &&this.context.formStatus
                &&this.context.formStatus!==Utils.formActions.create){
                return false;
            }
            let id=this.$route.params.id;
            if(id){
                return false;
            }
            return true;
        },
        shouldInitDefault(){//判断新建模式，并且需要设置默认值
            return this.isCreate()&&this.formItem.componentParams.valueType===controlTypeService.valueTypes.defaultValue.id;
        },
        isFixedValue(){//是否是固定字段(计算字段)，计算字段的值由后端计算，前端只能显示不能修改
            return this.formItem.componentParams.valueType===controlTypeService.valueTypes.fixedValue.id;
        },
        //begin 用户组织默认值相关的基础方法
        /** 
         * 设置默认值，需要根据默认值初始化引用数据
         * @param id  必须传入
         * @param title  必须传入
         */
        initDefaultForUserOrg(id,title,user_orgs){
            let _selectedItem=null;
            if(id){
                let idField=this.getIdField();
                let titleField=this.getTitleField();
                _selectedItem={};
                _selectedItem[idField]=id;
                _selectedItem[titleField]=title;
                //内置选择控件属性
                if(this.dataItems){
                    let has=_.find(this.dataItems, function(o) { return o[id] ===id; });
                    if(!has){//如果当前值不在缓存中，则附加到缓存数据后边
                        let _dataItems=_.cloneDeep(this.dataItems);
                        _dataItems.push(_selectedItem);
                        this.dataItems=_dataItems;
                    }
                }
                if(user_orgs){
                    //传入了多选对象
                    try{
                        user_orgs.push(_selectedItem);
                        //pclink选择控件属性
                        this.innerValue.push(id);
                        this.onSelect([_selectedItem]);
                    }catch (e){
                        console.log(e);
                    }
                }else{
                    this.selectedItem=_selectedItem;
                    //pclink选择控件属性
                    this.innerValue=id;
                    this.onSelect(_selectedItem);
                }
            }
        },
        setCurrentUserIfCreate(userId,users){
            var _this=this;
            console.log(this.entityResource)
            debugger
            this.entityResource&&this.entityResource.get({id:userId}).then(({data})=>{
                _this.initDefaultForUserOrg(data.userId,data.name,users);
            });
        },
        setCurrentOrgIfCreate(orgId,orgs){
            var _this=this;
            this.entityResource&&this.entityResource.get({id:orgId}).then(({data})=>{
                _this.initDefaultForUserOrg(data.id,data.name,orgs);
            });
        },//end 用户组织默认值相关的基础方法
        /**
         * 根据表单数据从后台计算某个字段的值：默认值或者计算属性
         * @param {*} _model 
         */
        calc(_model){
            var ds=this.context.metaEntity.dataResource();
            return ds.calc(_model).then(function({data}){
                return data;
            });
        },
        isReadonly(){//字段是否只读
            //设计模式返回
            if(this.designMode){
                return true;
            }
            //来自部件字段权限的控制
            let mode= this.context&&this.context.mode;
            if(Utils.widgetMode.readonly===mode){
                return true;
            }
            var metaEntity=this.context.metaEntity;
            if(metaEntity){
                let metaField=metaEntity.findField(this.formItem.dataField);
                if (metaField) {
                    return metaField.readonly;
                } else {
                    this.formItem.hidden = true;
                    return true;
                }
            }
            return false;
        },
        calcField(){//调用后端的api计算含有表达式的默认值或者固定字段
            let _this=this;
            let _model={};
            let name=this.formItem.dataField;
            //如果是计算字段，则需要传入依赖字段
            let dependOn=this.formItem.componentParams.dependOn;
            if(dependOn&&dependOn.length>0){
                _.each(dependOn,function(dep){
                    _model[dep]=_this.model[dep];
                });
            }
            _model[name]=null;
            return this.calc(_model,null).then((data)=>{
                return data[name];
            });
        },
        initFixedField(callback){//初始化计算字段的监听逻辑，当依赖的字段变化时，重新计算
            if(this.isFixedValue()){
                let _this=this;
                let dependOn=this.formItem.componentParams.dependOn;
                _.each(dependOn,function(dep){
                    _this.$watch(`model.${dep}`,function(){
                        _this.calcField().then((data)=>{
                            callback&&callback(data);
                        });
                    });
                })
            }
        },
        isNotEmpty(value){//判断当前控件的值是否不为空
            if(_.isBoolean(value)||_.isNumber(value)){
                return true;
            }
            return !_.isEmpty(value);
        }
    }
}