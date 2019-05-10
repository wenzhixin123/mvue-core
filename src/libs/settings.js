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
      }
  }
};
export default settings;