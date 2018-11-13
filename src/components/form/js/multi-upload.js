export default {
    props: {
        "value":{
            type:Array,
            default:function(){
                return [];
            }
        }
    },
    watch:{
        "value":function(newV,oldV){
            var _oldValidPart=[];
            if(oldV&&oldV.length){
                _.each(oldV,function(oldFile){
                    _oldValidPart.push({name:oldFile.name,url:oldFile.url});
                });
            }
            if(!newV||newV.length===0){
                this.defaultList=[];
            }
            if(this.uploaded){
                return;
            }
            if(!_.isEqual(newV,_oldValidPart)){
                this.defaultList=_.cloneDeep(newV)||[];
            }
        }
    },
    mounted () {
        if(!_.isEmpty(this.value)){
            this.defaultList=_.cloneDeep(this.value);
        }
    },
    methods:{
        emitByType(_uploadList){
            this.$emit("input",_uploadList);
        }
    }
}