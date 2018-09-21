<template>
<div class="meta-layout-con">
    <Row v-for="(rowItems,index) in settings" :key="index">
        <template v-if="isArray(rowItems)">
            <Col v-for="(rowItem,itemIndex) in rowItems" :key="itemIndex" :span="rowItemSpan(rowItems,rowItem)">
                <!--子元素还是个布局，用布局组件渲染-->
                <template v-if="isArray(rowItem)">
                    <meta-layout @popup-close="handleOnPopupClose" :settings="rowItem"></meta-layout>
                </template>
                <template v-else>
                    <component @popup-close="handleOnPopupClose" :is="rowItem.ctype" v-bind="componentProps(rowItem)"></component>
                </template>
            </Col>
        </template>
        <!--直接放组件，组件内部实现列排版-->
        <template v-else>
            <component @popup-close="handleOnPopupClose" :is="rowItems.ctype" v-bind="componentProps(rowItems)"></component>
        </template>
    </Row>
</div>
</template>
<script>
export default {
    name:"meta-layout",
    props:{
        settings:{//settings的length代表行，每个元素的length待办列，和二维数组对应
            type:[Array],
            required:true
        }
    },
    data(){
        return {
            
        };
    },
    methods:{
        //判断每个元素是否是数组
        isArray(rowItems){
            return _.isArray(rowItems);
        },
        //计算每个元素跨多少列，这里使用的iview的24列布局
        rowItemSpan(rowItems,rowItem){
            if(rowItem.span){
                return rowItem.span;
            }
            var allSpan=0,noSpanItemSize=0;
            _.each(rowItems,item=>{
                if(item.span){
                    allSpan+=item.span;
                }else{
                    noSpanItemSize+=1;
                }
            });
            //这里需要配置编写者自行保证总和为24列，暂不做特殊处理
            var spanSize=(24-allSpan)/noSpanItemSize;
            return spanSize;
        },
        //附加到组件的参数过滤掉ctype等内置属性
        componentProps(rowItem){
            var _props={};
            var ignores=['ctype'];
            _.forIn(rowItem,(value,key)=>{
                if(!_.includes(ignores,key)){
                    _props[key]=value;
                }
            });
            return _props;
        },
        handleOnPopupClose(){
            this.$emit("popup-close");
        }
    }
}
</script>
<style lang="scss" scoped>
.meta-layout-con{
    width:100%;
    height:100%;
}
</style>
