<template>
    <div class="opts-title-con" :class="{'opts-title-con-showopts':dropdownVisible}">
        <span class="fl imgBox">
            <i>
                <img v-if="params.iconField && item[params.iconField]" :src="contextPath + item[params.iconField]" @error="nofind($event)" alt="">
                <em>{{params.titleField?item[params.titleField].slice(0,1):(item.title?item.title.slice(0,1):'')}}</em>
            </i>
        </span>
        <div class="title-con-box table-column-center" @click="handleTitleClick">
            <div v-wordlimit="{length:params.wordlimit,text:item[params.metaField.name]}"></div>
        </div>
        <div class="opts-con-box table-column-center">
            <div v-if="permedBtns()" class="opts-con">
                <meta-operation v-for="(btn,index) in permedBtns()" :key="index" :operation="btn" v-if="index<2 || permedBtns().length==3" :widget-context="getWidgetContext()">
                    <a href="javascript:void(0)" class="btn opt-btn" :title="operation.title" slot-scope="{operation}">
                        <Icon :type="operation.icon"></Icon>
                    </a>
                </meta-operation>
                <Dropdown v-if="permedBtns().length>3" transfer @on-click="handleDropdownMenuClick" @on-visible-change="handleOnVisibleChange" class="opts-dropdown">
                    <a href="javascript:void(0)">
                        <Icon type="more"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem v-for="(btn,index) in permedBtns()" v-if="index>=2" :name="index" :key="index">
                            <meta-operation :operation="btn" :widget-context="getWidgetContext()">
                                <Icon :type="btn.icon"></Icon>
                                {{btn.title}}
                            </meta-operation>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        props:{
            params:{
                type:Object,
                required:true
            },
            btns:{
                type:Array
            },
            item:{
                type:Object,
                required:true
            },
            grid:{
                type:Object
            }
        },
        data: function(){
            return {
                dropdownVisible:false
            }
        },
        methods:{
            handleBtnClick(btn) {
                this.$emit('btnClick', btn);
            },
            handleOnVisibleChange(visible){
                this.dropdownVisible=visible;
            },
            handleDropdownMenuClick(itemName){
                var btn=this.btns[itemName];
                this.handleBtnClick(btn);
            },
            handleTitleClick(){
                if(this.grid&&this.grid.viewOnSingleClickRow){
                    return;
                }
                //这里btns必须包含view操作
                var btn=_.find(this.btns, function(o) {
                    return o.id ==='view';
                });
                if(btn&&Utils.hasDataPerm(this.item,btn)){
                    this.handleBtnClick(btn);
                }
            },
            permedBtns(){
                //判断是否是旧的grid操作，新的操作来源都是通过部件的操作配置，没有权限字段
                var isOldOperation=this.btns&&this.btns[0]&&this.btns[0][Utils.dataPermField];
                if(!isOldOperation){
                    return this.btns;
                }
                var _this=this;
                let _btns= _.filter(this.btns, function(o) {
                    //过滤掉查看操作，因为查看操作会在title列或者点击一行触发，有重复
                    if(o.id ==='view'){
                        return false;
                    }
                    let has=Utils.hasDataPerm(_this.item,o);
                    return has;
                });
                return _btns;
            },
            getWidgetContext(){
                let _self = this.grid,context;
                if(this.grid.context){
                    //是否-传入了上下文内容
                    context = this.grid.context
                }else {
                    context = {
                        grid: _self,
                        metaEntity: _self.metaEntity,
                        selectedId: this.item.id,
                        selectedItem: this.item
                    };
                }
                return context
            }
        }
    }
</script>
<style lang="less">
    .imgBox{
        padding:10px 0px;
    }
    .detailBox{
        padding-top:10px;
    }
    .opts-title-con{
        display:table;
        width:100%;
    .table-column-center{
        display:table-cell;
        vertical-align: middle;
    }
    .title-con-box{
        width:67%;
    &:hover{
         text-decoration: underline;
         cursor: pointer;
     }
    }
    .opts-con-box{
        width:33%;
    }
    .opts-con{
        display:none;
    .opt-btn{
        font-size: 17px;
        color:#949494;
        padding:0px;
        border:0px;
        margin-right:15px;
        /*float:left;*/
        display: inline-block;

    }
    .opts-dropdown{
        /*float:left;*/
    a{
        color:#949494;
    }
    }
    }
    }
    .ivu-table-row .opts-title-con.opts-title-con-showopts .opts-con{
        display: block;
    }
    .ivu-table-row.ivu-table-row-hover .opts-title-con .opts-con{
        display: block;
    }
</style>


