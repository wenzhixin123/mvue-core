<template>
    <div v-if="viewMode" class="form-item-view" v-text="viewModeValue||emptyText" :title="viewModeValue||emptyText"></div>
    <Multiselect v-else
        v-model="valueObj" 
        tag-placeholder="添加" 
        select-label="按enter键选择"
        selected-label="已选"
        deselect-label="按enter键取消选择"
        :placeholder="formItem.componentParams.placeholder" 
        label="text" 
        track-by="id" 
        :options="options" 
        :multiple="true" 
        :taggable="true" 
        @input="handleOnSelectChange"
        @tag="addTag">
        <template slot="noOptions">
            无数据
        </template>
    </Multiselect>
</template>
<script>
import controlBase from '../js/control_base';
export default {
    mixins: [controlBase],
    props: {
        "value":{
            type:Array
        }
    },
    data(){
        return {
            valueObj:null,
            options:[]//只要有值，valueObj和options就是相同的
        };
    },
    computed:{
        viewModeValue(){
            if(!_.isEmpty(this.value)){
                return this.value.join(',');
            }
            return '';
        }
    },
    watch:{
        "value":function (newV,oldV) {
            if(!this.isEqual()){
                this.reinitValueObj();
            }
        }
    },
    mounted(){
        if(this.value){
            this.reinitValueObj();
        }
    },
    methods:{
        reinitValueObj(){
            let _options=this.convertedValue();
            this.options=_options;
            this.valueObj=_.cloneDeep(_options);
        },
        convertedValue(){
            let _options=[];
            _.forEach(this.value,item=>{
                let _tagItem=this.buildTagItem(item);
                _options.push(_tagItem);
            });
            return _options;
        },
        buildTagItem(newTag){
            const tag = {
                text: newTag,
                id: newTag.substring(0, 2) + Math.floor((Math.random() * 10000000))
            }
            return tag;
        },
        addTag(newTag) {
            let tag=this.buildTagItem(newTag);
            this.options.push(tag);
            if(!this.valueObj){
                let _v=[tag];
                this.valueObj=_v;
            }else{
                this.valueObj.push(tag);
            }
            this.handleOnSelectChange();
        },
        isEqual(){
            if(_.isEqual(this.value,this.valueObj)){
                return true;
            }else if(_.isNil(this.value)||_.isNil(this.valueObj)){
                return false;
            }else{
                let eq=true;
                if(this.valueObj.length===this.value.length){
                    _.forEach(this.valueObj,item=>{
                        let text=item.text;
                        if(!_.includes(this.value,text)){
                            eq=false;
                            return false;
                        }
                    });
                    return eq;
                }
                return false;
            }
        },
        handleOnSelectChange(){
            let _v=[];
            _.forEach(this.valueObj,item=>{
                let text=item.text;
                _v.push(text);
            });
            this.$emit('input',_v);
            this.dispatch&&this.dispatch('FormItem', 'on-form-change', _v);
        }
    }
}
</script>


