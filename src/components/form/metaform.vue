<template>
    <div class="meta-form-panel" :class="{'has-buttons':hasButtons()}">
        <slot></slot>
        <div v-transfer-dom="'#default-form-uuid-'+entityName" :data-transfer="transfer" class="form-toolbar" :class="{'has-buttons':hasButtons()}" slot="toolbar">
            <div v-if="hasButtons()" :class="{'onepx-stroke':hasButtons()}"></div>
            <Button v-if="innerPermissions.cancel" type="ghost" size="small"  @click.stop.prevent="handleCancel">取消</Button>
            <Button v-if="innerPermissions.openEdit&&action===formActions.view" type="primary" size="small" @click.stop.prevent="handleOpenEdit">编辑</Button>
            <Button v-if="!id||(innerPermissions.edit&&action!==formActions.view)" type="primary" size="small" @click.stop.prevent="saveModel">保存</Button>
            <Button v-if="id&&innerPermissions.del&&action!==formActions.view" type="primary" size="small" @click.stop.prevent="onDelete">删除</Button>
        </div>
    </div>
</template>
<script>
    import TransferDom from './js/transfer_dom';
    export default {
        directives: { TransferDom },
        props:{
            model:{
                type:Object,
                required:true
            },
            action:{//表示是否查看模式的表单
                type:String
            },
            initialData:{
                type:Object,
                required:false,
                default:function(){
                    return {};
                }
            },
            entityName:{
                type:String,
                required:true
            },
            beforeSave:{
                type:Function
            },
            afterSave:{
                type:Function
            },
            permissions:{//控制按钮的权限
                type:Object,
                require:false,
                default:function(){
                    return {
                        openEdit:false,//开启编辑按钮权限
                        edit:false,//修改或者保存按钮权限
                        del:false,//删除按钮权限
                        cancel:false//取消按钮
                    };
                }
            },
            preprocessed:{//表示表单需要的数据是否初始化完毕
                type:Boolean,
                default:false
            },
            transfer: {
                type: Boolean,
                default: false
            }
        },
        computed:{
            isArchived(){//是否已归档
                if(eventBus.record){
                    return !!eventBus.record.isArchived;
                }
                return false;
            }
        },
        data:function(){
            var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            var dsWrapper=metaEntity.dataResourceWrapper();
            return {
                dataResource:dsWrapper.$resource,
                dataResourceInnerVueInst:dsWrapper.$innerVueInst,
                changedQueue:[],//智能验证变化队列
                metaEntity:metaEntity,
                id:this.$route.params.id,
                isMetaForm:true,
                openEditClicked:false,
                innerPermissions:_.cloneDeep(this.permissions),
                isSavingToServer:false,//表示是否正在保存数据到服务器，用来处理保存时触发重复提交数据的bug
                formActions:Utils.formActions
            };
        },
        watch:{
            permissions:{
                handler:function(){
                    this.innerPermissions=_.cloneDeep(this.permissions);
                },
                deep:true
            },
            model:{
                handler:function(){
                    this.doValidation();
                },
                deep:true
            }
        },
        methods:{
            handleCancel:function(){
                router.go(-1);
            },
            doValidation:function(callback){
                var _this=this;
                //启用智能校验
                Utils.smartValidate(_this,this.model,this.$validator,function(){
                    callback&&callback();
                });
            },
            saveModel:function(){
                var _this=this;
                this.doValidation(function(){
                    let before=_this.beforeSave();
                    if (before && before.then){//返回的Promise对象
                        before.then(function(valid){
                            if(false!==valid){//true 表示可继续保存
                                _this.doSave();
                            }
                        });
                    }else if(before!==false){//普通true or false
                        _this.doSave();
                    }
                });
            },
            ignoreReaonlyFields(){
                let _model={};
                let _this=this;
                _.each(_this.model,function(v,k){
                    let metaField=_this.metaEntity.findField(k);
                    if(metaField&&metaField.readonly){
                        //readonly字段不提交
                    }else{
                        _model[k]=v;
                    }
                });
                return _model;
            },
            doSave(){
                var _this=this;
                if(_this.isSavingToServer){
                    return;
                }
                _this.isSavingToServer=true;
                if(this.id){//更新
                    let _model=this.ignoreReaonlyFields();
                    _this.dataResource.update({id:this.id},_model).then(function({data}){
                        _this.isSavingToServer=false;
                        _this.afterSaveChain("on-edited",data,'编辑成功');
                    },function(){
                        _this.isSavingToServer=false;
                    });
                }else{//新建
                    let _model=this.ignoreReaonlyFields();
                    _this.dataResource.save(_model).then(function({data}){
                        _this.isSavingToServer=false;
                        _this.id=data[_this.metaEntity.getIdField().name];
                        _this.afterSaveChain("on-created",data,'保存成功');
                    },function(){
                        _this.isSavingToServer=false;
                    });
                }
            },
            afterSaveChain(evtName,data,msg){
                let _this=this;
                let after=_this.afterSave(data);
                if (after && after.then){//返回的Promise对象
                    after.then(function(valid){
                        if(false!==valid){//true 表示可继续保存
                            iview$Message.success(msg);
                            _this.$emit(evtName,data);
                        }
                    });
                }else if(after!==false){
                    iview$Message.success(msg);
                    _this.$emit(evtName,data);
                }
            },
            onDelete:function(){
                var _this = this;
                var delParams={id:this.id};
                var tips='确定删除吗?';
                iview$Modal.confirm({
                    title: '提示',
                    content: tips,
                    onOk: () => {
                        _this.dataResource.delete(delParams).then(function(res){
                            iview$Message.success('删除成功');
                            _this.$emit("on-deleted");
                        });
                    }
                });
            },
            handleOpenEdit(){
                let _query=_.extend({},this.$route.query);
                _query[Utils.queryKeys.action]=Utils.formActions.edit;
                router.push({
                    name:this.$route.name,
                    params:this.$route.params,
                    query:_query
                });
            },
            hasButtons(){//工具栏是否有按钮存在，没有按钮的话，工具栏隐藏
                if(this.innerPermissions.cancel){
                    return true;
                }
                if(this.innerPermissions.openEdit&&this.action===this.formActions.view){
                    return true;
                }
                if(!this.id||(this.innerPermissions.edit&&this.action!==this.formActions.view)){
                    return true;
                }
                if(this.id&&this.innerPermissions.del&&this.action!==this.formActions.view){
                    return true;
                }
                return false;
            },
        }
    }
</script>
<style lang="scss" scoped>
    .meta-form-panel{
        position: relative;
        .form-toolbar{
            position: absolute;
        }
        &.has-buttons{
            padding-bottom: 88px;
        }
    }
</style>


