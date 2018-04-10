<template>
    <div class="control-tmpl-panel">
        <component :is="'Meta'+formItem.componentType" :form-item="formItem" :mode="mode"></component>
    </div>
</template>
<script>
import controlTypeService from '../js/control_type_service';
import allComponents from '../js/all_components';
export default {
    props:{
        formItem:{
            type:Object,
            required:true
        },
        mode:{
            type:String,
            default:controlTypeService.controlMode.normal//["design","normal"],design设计模式，组件不可操作;normal普通模式，可以填写数据
        }
    },
    mixins: [allComponents]
}
</script>
<style lang="scss">
    .control-tmpl-panel{
        .form-control[disabled], .form-control[readonly],.ivu-input[disabled]{
            cursor:auto;
            background-color:#fff;
        }
        input[type="radio"][disabled], input[type="checkbox"][disabled], input[type="radio"].disabled, input[type="checkbox"].disabled{
            cursor:auto;
        }
        textarea{
            resize:none;
        }
    }
</style>


