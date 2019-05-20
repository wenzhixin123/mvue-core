export default {
  props: {
    advanceSearchFields:{
      type:Array,
      require:true
    },
    entityName: {
      type: String,
      required: true
    },
    quicksearch:{
      type:Object,
    },
    quicksearchKeyword:{
      type:String
    },
    initModel:{//初始查询条件
      type:Object
    },
    queryOptions:{//grid的queryOptions
      type:Object
    },
    connectKeyword:{
      type:Boolean,
      default:false
    },
    searchWhenMounted:{//如果设置了默认条件，需要激发一次查询
      type:Boolean,
      default:false
    } 
  }
}