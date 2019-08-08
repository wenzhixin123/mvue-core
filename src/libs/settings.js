const settings={
  control:{
      userSelect:{
        filters:'status eq 1',//用户选择控件，默认查询条件
        entityName:"user",
        idField:"id",
        nameField:"name",
        loginField:"userName",
        detailFields:"mobile,email",
        orgField:"orgId"
      },
      orgSelect:{
        filters:'status eq 1',//部门选择控件，默认查询条件
        entityName:"organization",
        idField:"id",
        nameField:"name",
        parentField:"parentId"
      },
      refEntity:{
        hideDeleted:false//引用数据被删除后，是否默认不显示出来
      },
      dateTime:{
        gridFormatter:''//日期时间在grid显示时使用的格式化字符串，支持simple和标准格式化串，如：YYYY-MM-DD HH:mm:ss
      },
      grid:{
        advanceSearchTitle:'高级查询'
      }
  },
  sidExpired:1//指定sid存储的topEntity数据过期天数
};
export default settings;