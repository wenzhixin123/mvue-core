<template>
    <div class="meta-form-panel">
        <slot></slot>
        <div class="form-toolbar" slot="toolbar">
            <button class="ivu-btn ivu-btn-text" type="button"  @click.stop.prevent="handleCancel">取消</button>
            <button type="button" class="btn btn-primary" @click.stop.prevent="saveModel"><span>保存</span></button>
            <button class="btn btn-danger" type="button" v-if="id" @click.stop.prevent="onDelete">删除</button>
        </div>
    </div>
</template>
<script>
export default {
    props:{
        model:{
            type:Object,
            required:true
        },
        entityName:{
            type:String,
            required:true
        }
    },
    data:function(){
        var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
        return {
            dataResource:metaEntity.dataResource(),
            changedQueue:[],//智能验证变化队列
            metaEntity:metaEntity,
            id:this.$route.params.id,
            isMetaForm:true
        };
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
                _this.doSave();
            });
        },
        doSave(){
            var _this=this;
            if(this.id){//更新
                let _model=Utils.reduceModelForUpdate(_this.model);
                _this.dataResource.update({id:this.id},_model).then(function({data}){
                    iview$Message.success('编辑成功');
                    _this.$emit("on-edited");
                });
            }else{//新建
                _this.dataResource.save(_this.model).then(function({data}){
                    _this.id=data[_this.metaEntity.getIdField().name];
                    iview$Message.success('保存成功');
                    _this.$emit("on-created");
                });
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
        }
    }
}
</script>

