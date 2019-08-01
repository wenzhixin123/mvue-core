/**
 * 控件参数定义属性说明
 *
 * id: 属性名
 * inputType: 属性的输入控件类型
 * default: 属性的默认值
 * store: 属性的存储位置
 *        MetaField: 存储为字段元数据对象的直接属性 
 *        MetaField.inputParams: 存储为字段元数据对象的inputTypeParams的属性 
 *        Layout: 直接存储在表单布局layout里边 
 */
 /**
  属性的存储位置，可取metaField、metaField.inputParams和layout三个值
  */
const store={
  MetaField:'MetaField',
  MetaFieldInputParams:'MetaField.inputParams',
  Layout:'Layout',
  Form:'Form'
};
/**
  基础类型: 'Boolean','SingleLineText','MultiLineText','Number'
  对象类型: 'Rules','LimitLength','AutoSize'
 */
let inputTypeArray=[
  'Boolean','SingleLineText','MultiLineText','Number','SingleSelect','SingleSelectWithInput',
  'Rules','LimitRange','AutoSize','Decimal','OptionsEditor','Json','RefEntity',
  'RefEntityField','EntityField','DefaultValue','PropSettings','Events'
]; 
let inputType={};
inputTypeArray.forEach(t => {
  inputType[t]=t;
});
//定义所有表单控件公共的基础属性
const commonProps=[
  {
    id:'name',
    inputType:inputType.EntityField,
    default:'',
    required:true,
    store:store.MetaField,
    title:'名称'
  },
  {
    id:'title',
    inputType:inputType.SingleLineText,
    default:'',
    required:true,
    store:store.MetaField,
    title:'显示名称'
  },
  {
    id:'required',
    inputType:inputType.Boolean,
    default:false,
    store:store.MetaField,
    title:'是否必填'
  },
  {
    id:'description',
    inputType:inputType.SingleLineText,
    default:'',
    store:store.MetaField,
    title:'提示文字'
  },
  {
    id:'descLevel',
    inputType:inputType.SingleSelect,
    options:[{value:'info',title:'鼠标划入时显示'},{value:'warn',title:'重要提示，直接在控件下方显示'}],
    default:'',
    store:store.Layout,
    title:'提示位置'
  },
  {
    id:'semantics',
    inputType:inputType.SingleSelectWithInput,
    options:[
      {value:'title',title:'标题'}
    ],
    default:'',
    store:store.MetaField,
    title:'语义'
  },
  {
    id:'mode',
    inputType:inputType.SingleSelectWithInput,
    options:[
      {value:'',title:'默认'},
      {value:'readonly',title:'只读'},
      {value:'forceView',title:'强制查看'},
      {value:'invisible',title:'隐藏'}],
    default:'',
    store:store.Layout,
    title:'控件状态',
    dynamic:true
  }
]; 
//动态属性和事件规则属性定义 
const propSettingsProp={
  id:'propSettings',
  inputType:inputType.PropSettings,
  default:null,
  store:store.Form,
  title:'动态属性'
}; 
const eventsProp={
  id:'events',
  inputType:inputType.Events,
  default:false,
  store:store.Form,
  title:'事件规则'
}; 
const pageCommonProps=[propSettingsProp,eventsProp];
const unique={
  id:'unique',
  inputType:inputType.Boolean,
  default:false,
  store:store.MetaField,
  title:'是否唯一'
};
const placeholder={
  id:'placeholder',
  inputType:inputType.SingleLineText,
  default:'',
  store:store.MetaFieldInputParams,
  title:'占位符'
};
 /**
  * 每一个验证规则的来源
  * 1: iview async-validator rules 
  * 2: { 
  *      type:'compare',
  *      operator:'lessThan',//可取lessThan|biggerThan|equals
  *      fieldName:'field2'
  *    }  
  */   
const rules={
  id:'rules',
  inputType:inputType.Rules,
  default:[],
  store:store.MetaFieldInputParams,
  title:'验证规则'
}
//leap查询条件属性
const queryOptions={
  id:'queryOptions',
  inputType:inputType.Json,
  default:{},
  store:store.MetaFieldInputParams,
  title:'引用实体查询条件'
}
//多对一引用关系属性
const manyToOneRelation={
    id:'relation',
    inputType:inputType.RefEntity,
    default:{
        targetEntity:'',
        type:'many-to-one'
    },
    required:true,
    store:store.MetaField,
    title:'引用实体'
};
//选项属性
const options={
    id:'options',
    inputType:inputType.OptionsEditor,
    default:'',
    store:store.MetaField,
    title:'选项'
};
//默认值
const defaultValue={
    id:'defaultExpr',
    inputType:inputType.DefaultValue,
    default:null,
    store:store.MetaField,
    title:'默认值'
};
export default {
  store,//属性的存储位置
  inputType,//属性的控件类型
  getLayoutPropsDefault(props){
    let params={};
    _.forEach(props,(item)=>{
      if(_.has(item,'id')&&item.store===store.Layout){
        params[item.id]=_.cloneDeep(item.default);
      }
    });
    return params;
  },
  /**
   * @props 属性定义数组
   */
  getPropsDefault(props){
    let params={};
    _.forEach(props,(item)=>{
      if(_.has(item,'id')){
        params[item.id]=_.cloneDeep(item.default);
      }
    });
    return params;
  },
  /**
   * 合并所有的定义，保持顺序，克隆定义不影响原始定义
   */
  merge(...props){
    let _props=[].concat(commonProps,props,pageCommonProps);
    return _.cloneDeep(_props);
  },
  unique,
  placeholder,
  rules,
  options,
  queryOptions,
  manyToOneRelation,
  defaultValue,
  pageCommonProps
}