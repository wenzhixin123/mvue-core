export default {
    props: {
        "value":{
            type:Object,
            default:function(){
                return null;
            }
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _oldValidPart=null;
            if(oldV){
                _oldValidPart={
                    name:oldV.name,
                    url:oldV.url
                };
            }
            if(_.isEmpty(newV)){
                this.defaultList=[];
            }
            if(this.uploaded){
                return;
            }
            if(!_.isEqual(newV,_oldValidPart)){
                this.defaultList=_.cloneDeep([newV]);
            }
        }
    },
    mounted () {
        if(!_.isEmpty(this.value)){
            this.defaultList=_.cloneDeep([this.value]);
        }
    },
    methods:{
        emitByType(_uploadList){
            if(_.isEmpty(_uploadList)){
                this.$emit("input",null);
            }else{
                this.$emit("input",_uploadList[0]);
            }
        }
    }
}