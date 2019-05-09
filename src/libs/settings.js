const settings={
  control:{
      userSelect:{
        filters:'status eq 1',
        entityName:"user",
        idField:"id",
        nameField:"name",
        loginField:"userName",
        detailFields:"mobile,email",
        orgField:"orgId"
      },
      orgSelect:{
        filters:'status eq 1',
        entityName:"organization",
        idField:"id",
        nameField:"name",
        parentField:"parentId"
      }
  }
};
export default settings;