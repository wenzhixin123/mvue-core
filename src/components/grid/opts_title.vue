<template>
    <div class="opts-title-con" :class="{'opts-title-con-showopts':dropdownVisible}">
        <div class="title-con-box table-column-center" @click="handleTitleClick">
            <div v-wordlimit="{length:params.wordlimit,text:item[params.metaField.name]}"></div>
        </div>
        <div class="opts-con-box table-column-center">
            <div v-if="permedBtns()" class="opts-con">
                <a v-for="(btn,index) in permedBtns()" v-if="index<2 || permedBtns().length==3" :key="index" @click.stop.prevent="handleBtnClick(btn)"
                    href="javascript:void(0)" class="btn opt-btn" :title="btn.title" >
                    <Icon :type="btn.icon"></Icon>
                </a>
                <Dropdown v-if="permedBtns().length>3" transfer @on-click="handleDropdownMenuClick" @on-visible-change="handleOnVisibleChange" class="opts-dropdown">
                    <a href="javascript:void(0)">
                        <Icon type="more"></Icon>
                    </a>
                    <DropdownMenu slot="list">
                        <DropdownItem v-for="(btn,index) in permedBtns()" v-if="index>=2" :name="index" :key="index">
                            <Icon :type="btn.icon"></Icon>
                            {{btn.title}}
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
        }
    }
}
</script>
<style lang="less" scoped>
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
            color:#949494;
            padding:0px;
            border:0px;
            margin-right:8px;
            float:left;
        }
        .opts-dropdown{
            float:left;
            a{
                color:#949494;
            }
        }
    }
}
</style>


