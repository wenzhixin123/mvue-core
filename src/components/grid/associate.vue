<template>
    <div class="grid-associate-con">
        <div @click="showImport" style="width:100%;">
            <slot>
                <Button :type="operation.btnType||'primary'"  :icon="operation.icon">{{(operation.title)}}</Button>
            </slot>
        </div>
        <Drawer
            :title="'选择关联'+metaEntity.title+'数据'"
            v-model="showDrawer"
            :width="80"
            :mask-closable="false"
            :styles="styles"
            class="grid-drawer-con"
        >   
            <ref-entity-select ref="selectRef" v-if="showDrawer" style="height: calc(100% - 55px); overflow: auto;"
                :form-item="formItem"
                :multiple="true"
            ></ref-entity-select>
            <div class="drawer-footer">
                <Button @click="showDrawer = false">关闭</Button>
                <Button type="primary" @click="confirmAssociate">确定</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
import context from "../../libs/context";
export default {
    props:{
        operation:{
            type:Object,
            required:true
        },
        widgetContext:{
            type:Object,
            required:true
        }
    },
    watch:{
        showDrawer:function(){
            if(!this.showDrawer){
                this.widgetContext.grid.reload();
            };
        }
    },
    data(){
        let grid=this.widgetContext.grid;
        let params={},metaEntity=null,updateModel={},idField=null,titleField=null,dataResource=null;
        if(!grid.ifOneToManyGrid()){
            context.error({
                content:'必须在一对多关系列表使用关联操作'
            });
        }else{
            //获取父实体的数据id
            grid.fillParamsWithRelation(params);
            let refField=grid.getRefField();
            //生成待更新的数据model，只更新引用字段的值为父实体的id
            updateModel[refField]=params.parentEntityId;
            metaEntity=grid.metaEntity;
            dataResource=metaEntity.dataResource();
            idField=metaEntity.getIdField().name;
            titleField=metaEntity.firstTitleField().name;
            this.operation.title=this.operation.title||'关联'+metaEntity.title;
        }
        return {
            showDrawer:false,
            styles:{
                height: 'calc(100% - 55px)',
                overflow: 'hidden'
            },
            formItem:{
                componentParams:{
                    entityId:metaEntity.name,
                    idField:idField,
                    titleField:titleField
                }
            },
            grid:grid,
            metaEntity:metaEntity,
            updateModel:updateModel,
            dataResource:dataResource,
            updating:false
        };
    },
    methods:{
        //显示导入框
        showImport(){
            this.showDrawer=true;
        },
        confirmAssociate(){
            if(this.updating){
                return;
            }
            let selectedItem=this.$refs.selectRef.selectedItem;
            if(!selectedItem){
                this.$Modal.info({
                    title:"提示",
                    content:"请选择关联数据"
                });
                return;
            }
            this.updating=true;
            selectedItem.forEach(item => {
                let id=item[this.formItem.componentParams.idField];
                this.dataResource.update({id:id},this.updateModel).then(()=>{
                    this.updating=false;
                    this.showDrawer=false;
                },(err)=>{
                    this.updating=false;
                });
            });
        }
    },
    components:{
        'ref-entity-select':require('../form/control_tmpl/ref-entity-select')
    }
}
</script>
