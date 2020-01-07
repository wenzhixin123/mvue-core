<template>
    <component :is="tmplType" :key="pageKey()"></component>
</template>
<script>
    import context from "../../../libs/context";
    var pathToRegexp = require('path-to-regexp');
export default {
    props:{
        type:{//可取值范围：['form','list','sub-page','sub-page-relation','third-page','third-page-relation','dync-page']
            type:String
        }
    },
    computed:{
        tmplType(){
            if(this.type){
                return `m-page-${this.type}`;
            }else{
                return 'm-page-default';
            }
        }

    },
    data(){
        return {

        };
    },
    methods:{
        pageKey(){
            let routeInfo = context.componentInRouteInfo(this);
            let url=this.$route.path;
            if (routeInfo&&routeInfo.route.path) {
                url = pathToRegexp.compile(routeInfo.route.path)(this.$route.params);
            }
            return url;
        }
    },
    components:{
        'm-page-default':require('./default').default,
        'm-page-form':require('./form').default,
        'm-page-list':require('./list').default,
        'm-page-sub-page':require('./sub-page').default,
        'm-page-sub-page-relation':require('./sub-page-relation').default,
        'm-page-third-page':require('./third-page').default,
        'm-page-third-page-relation':require('./third-page-relation').default,
        'm-page-dync-page':require('./dync-page').default
    }
}
</script>
