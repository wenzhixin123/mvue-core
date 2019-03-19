<template>
    <component :is="tmplType"></component>
</template>
<script>
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
    components:{
        'm-page-default':require('./default'),
        'm-page-form':require('./form'),
        'm-page-list':require('./list'),
        'm-page-sub-page':require('./sub-page'),
        'm-page-sub-page-relation':require('./sub-page-relation'),
        'm-page-third-page':require('./third-page'),
        'm-page-third-page-relation':require('./third-page-relation'),
        'm-page-dync-page':require('./dync-page')
    }
}
</script>
