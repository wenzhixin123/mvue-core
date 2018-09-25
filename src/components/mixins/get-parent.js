export default {
    methods:{
        getParentForm(){//不停的向上找父表单组件
            var _parent=this.$parent;
            while(_parent){
                if(_parent.isMetaForm){
                    return _parent;
                }else{
                    _parent=_parent.$parent;
                }
            }
            return null;
        }
    }
}