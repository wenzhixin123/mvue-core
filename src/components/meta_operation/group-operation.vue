<template>
    <Dropdown transfer>
        <Button :type="operation.btnType||'primary'" 
            :title="operation.title" >
            {{operation.title}}
            <Icon type="ios-arrow-down"></Icon>
        </Button>
        <DropdownMenu slot="list" v-if="operation.children">
            <template v-for="(firstItem,index) in operation.children">
                <Dropdown :key="index" transfer placement="right-start" style="width:100%;" v-if="!isEmpty(firstItem.children)">
                    <DropdownItem>
                        {{firstItem.title}}
                        <Icon type="ios-arrow-forward"></Icon>
                    </DropdownItem>
                    <DropdownMenu slot="list">
                        <DropdownItem v-for="(secondItem,index2) in firstItem.children" :key="index2">
                            <div class="btn-con">
                                <m-operation :operation="secondItem" :widget-context="widgetContext"></m-operation>
                            </div>
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <DropdownItem :key="index" v-else>
                    <div class="btn-con">
                        <m-operation :operation="firstItem" :widget-context="widgetContext"></m-operation>
                    </div>
                </DropdownItem>
            </template>
        </DropdownMenu>
    </Dropdown>
</template>
<script>
export default {
    props:{
        widgetContext:{//由使用操作的部件传入的部件上下文
            type:Object,
            required:true
        },
        //最多支持两层嵌套：{"name": "group","operationType": "group","title": "更多","children":[{"name": "create","operationType": "common","title": "新建"},{"name": "del","operationType": "common","title": "删除","children":[{"name": "create","operationType": "common","title": "新建"},{"name": "del","operationType": "common","title": "删除"}]}]}
        operation:{//操作的定义，必传参数
            type:Object,
            required:true
        }
    },
    data(){
        return {

        };
    },
    methods:{
        isEmpty(item){
            return _.isEmpty(item);
        }
    }
}
</script>
