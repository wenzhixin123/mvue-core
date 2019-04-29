<template>
    <m-field v-if="editRow" :name="metaField.name"></m-field>
    <div v-else :class="{'ivu-table-cell-ellipsis':true}">
        <Icon v-if="textShowed" type="ios-eye-off" slot="suffix" @click="hideText"/>
        <Icon v-else type="ios-eye" slot="suffix" @click="showText"/>
        <span v-if="textShowed" :title="value">{{value}}</span>
        <span v-else>********</span>
    </div>
</template>
<script>
import batchEditorSupport from './batch-editor-support';
export default {
    mixins:[batchEditorSupport],
    props:{
        value:{
            type:String
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

