<template>
<div>
    <div style="width:20%;position:absolute;z-index:1;right:0px;">
        <div class="ref-entity-list-header">
            <h4>已选</h4>
        </div>
        <div class="ref-entity-list-body">
            <template v-if="multiple&&selectedItem">
                <Tag color="success" v-for="item in selectedItem" :key="item[getIdField()]" :title="title(item)">{{title(item)}}</Tag>
            </template>
            <Tag color="success" v-if="(!multiple)&&selectedItem" :title="title(selectedItem)">{{title(selectedItem)}}</Tag>
        </div>
    </div>
    <div style="width:80%;">
        <Row>
            <Col span="24" style="border-right:1px solid #e8e8e8;">
                <meta-grid v-if="preprocessed" ref="gridList"
                    v-bind="layoutSettings"
                    @on-current-change="handleOnCurrentChange"
                    @on-selection-change="handleOnSelectionChange">
                </meta-grid>
            </Col>
        </Row>
    </div>
</div>
</template>
<script>
import refEntitySelect from '../mixins/ref-entity-select';
//import metaLayoutConvertor from '../../meta-layout/layout-convertor';
export default {
    mixins:[refEntitySelect],
    props:{
        formItem:{
            type:Object,
            required:true
        },
        value:{
            type:[Array,Object]
        },
        multiple:{
            type:Boolean,
            default:false
        },
        queryOptions: {
            type:Object
        }
    },
    data(){
        let layoutSettings={
            toolbar:{
                quicksearch:{}
            },
            highlightRow:!this.multiple,
                maxColumnsSize:5,
                showSelection:this.multiple,
                handleOnTitleClick:false,
                entityName:this.formItem.componentParams.entityId
        };
        if(this.queryOptions && this.queryOptions.select){
            let op=_.assign({},this.queryOptions);
            delete op.limit;
            layoutSettings["queryOptions"]=op;
            if(op.select){
                let selectArray=op.select.split(",");
                let columns=[];
                _.forEach(selectArray,(column)=>{
                    columns.push({key:column});
                });
                layoutSettings["columns"]=columns;
            }
        }
        return {
            layoutSettings,
            preprocessed:false
        };
    },
    mounted(){
        this.preprocess();
    },
    methods:{
        async preprocess(){
            let metaEntity=this.$metaBase.findMetaEntity(this.entityName);
            let settings=await metaEntity.getPage("select");
            //这里对于settings先不做metaLayoutConvertor处理
            if(!_.isEmpty(settings)){
                // settings= metaLayoutConvertor.convert(settings,this,{isPopup:true});
                // let _settings=_.extend(this.layoutSettings,settings.layout[0]);
                // if(_settings.hasOwnProperty('ctype')){
                //     delete _settings.ctype;
                // }
                //this.layoutSettings=_settings;
                this.layoutSettings=_.extend(this.layoutSettings,settings);
            }
            this.preprocessed=true;
        }
    }
}
</script>
<style lang="less">
.ref-entity-list-header{
    padding: 8px 16px;
    background: #f9fafc;
    color: rgba(0, 0, 0, 0.65);
    border-bottom: 1px solid #e8e8e8;
    overflow: hidden;
    width: 100%;
}
.ref-entity-list-body{
    padding:16px 0px 0px 16px;
}
</style>
