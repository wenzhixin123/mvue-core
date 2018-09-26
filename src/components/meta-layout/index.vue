<template>
<div class="meta-layout-con">
    <Row v-for="(rowItems,index) in innerSettings" :key="index">
        <template v-if="isArray(rowItems)">
            <Col v-for="(rowItem,itemIndex) in rowItems" :key="itemIndex" :span="rowItemSpan(rowItems,rowItem)">
                <!--子元素还是个布局，用布局组件渲染-->
                <template v-if="isArray(rowItem)">
                    <meta-layout @popup-close="handleOnPopupClose" :settings="rowItem" :itemProcessor="itemProcessor"></meta-layout>
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
    var minimist=require("minimist");
export default {
    name:"meta-layout",
    props:{
        settings:{//settings的length代表行，每个元素的length待办列，和二维数组对应
            type:[Array],
            required:true
        },
        itemProcessor:{ //内容组件处理器
            type:Function
        }
    },
    data(){
        var processed=this.preprocess(this.settings);
        return {
            innerSettings:processed
        };
    },
    methods:{
        preprocess(st) {
            var processedSettings=[];
            _.forEach(st,(rowItem)=>{
                if(!_.isArray(rowItem)){
                    var component=this.processItem(rowItem);
                    processedSettings.push(component);
                    return;
                }
                var row=[];
                processedSettings.push(row);
                _.forEach(rowItem,(colItem)=>{
                    if(_.isArray(colItem)){
                        row.push(colItem);
                        return ;
                    }
                    var component=this.processItem(colItem);
                    row.push(component);
                });
            });
            return processedSettings;
        },
        //判断每个元素是否是数组
        isArray(rowItems){
            return _.isArray(rowItems);
        },
        //计算每个元素跨多少列，这里使用的iview的24列布局
        rowItemSpan(rowItems,rowItem){
            var allSpan=0;
            _.each(rowItems,item=>{
                if(item.span){
                    allSpan+=item.span;
                }else{
                    allSpan+=1;
                }
            });
            var itemSpan=1;
            if(rowItem.span){
                itemSpan=rowItem.span;
            }
            //这里需要配置编写者自行保证总和为24列，暂不做特殊处理
            var spanSize=Math.floor((24*itemSpan)/allSpan);
            return spanSize;
        },
        //附加到组件的参数过滤掉ctype等内置属性
        processItem(rowItem){
             var component=this.cmdProcess(rowItem);
            if(this.itemProcessor!=null){
                component=this.itemProcessor(component);
            }
            return component;
        },
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
        },
        cmdProcess(item){
            if(_.isEmpty(item) || !_.isString(item)){
                return item;
            }
            if(item.indexOf("@")!=0){
                return item;
            }
             var args=_.split(item," ");
            var componentName=_.kebabCase(args[0].replace("@",""));
            var component={
                ctype:componentName
            }
            if(args.length>1){
                var spliced=args.splice(1);
                var params=minimist(spliced);
                _.forIn(params,(val,key)=>{
                    if(key=="_"){
                        _.forEach(val,(sKey,index)=>{
                            if(index==0){
                                component["value"]=sKey;
                            }else{
                                component[sKey]=true;
                            }
                        });
                    }else {
                        if(key=="s"){
                            component["span"]=val;
                        }if(key=="i"){
                            component["icon"]=val;
                        }if(key=="t"){
                            component["title"]=val;
                        }if(key=="n"){
                            component["name"]=val;
                        }if(key=="v"){
                            component["value"]=val;
                        }if(key=="c"){
                            component["code"]=val;
                        }else{
                            component[key]=val;
                        }
                    }
                });
            }

            return component;
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
