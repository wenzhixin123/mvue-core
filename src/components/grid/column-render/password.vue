<template>
    <div :class="{'ivu-table-cell-ellipsis':true}">
        <Icon v-if="textShowed" type="ios-eye-off" slot="suffix" @click="hideText"/>
        <Icon v-else type="ios-eye" slot="suffix" @click="showText"/>
        <span v-if="textShowed" :title="value">{{value}}</span>
        <span v-else>********</span>
    </div>
</template>
<script>
export default {
    props:{
        value:{
            type:String,
            required:true
        }
    },
    data(){
        return {
            textShowed:false
        }
    },
    methods:{
        showText(){
            this.textShowed=true;
        },
        hideText(){
            this.textShowed=false;
        }
    }
}
</script>

