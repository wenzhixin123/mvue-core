import widgetMode from '../js/widget-mode';
import controlTypeService from '../js/control_type_service';
import metaformUtils from '../js/metaform_utils';
export default {
  computed:{
    itemLabelWidth(){
        if(this.labelPosition=="top"){
            return this.labelWidth;
        }
        if(typeof this.labelWidth=="undefined" || this.labelWidth==null){
            return 120;
        }
        return this.labelWidth;
    }
  },
  methods:{
    initValidateRulesByMetaEntity(metaEntity,entity){
        let innerRules={};
        _.forEach(metaEntity.getDefaultFormFieldsWithIds(),(fieldName) =>{
            var metaField=metaEntity.findField(fieldName);
            var formItem=controlTypeService.buildFormItemByMetaField(metaField);
            var rules=metaformUtils.initValidation(formItem,metaEntity,null,entity,false);
            if(rules.length>0) {
                innerRules[formItem.dataField] = rules;
            }
        });
        return innerRules;
    },
    //传递给表单组件的context，可以控制表单组件的显示状态
    fieldContext(item,metaEntity) {
        //字段视图
        let _obj = {
            metaEntity: this.metaEntity||metaEntity,
            mode: this.mode||(this.context&&this.context.mode)
        };
        return _obj;
    },
    layoutProcessor:function(item){
        //处理["name","title"]写法的字段布局
        let _item=null;
        if(_.isString(item)){
            _item = {
                ctype:"m-field",
                name:item
            }
        }else{
            //已经由命令行解析程序处理后的对象：参数解析完毕，--width 100
            //定义哪些是表单内部的控件，需要将value转为name
            let formControls={
                "meta-field":true,
                "metaField":true,
                "m-field":true,
                "m-expand":true,
                "m-confirm":true,
                "m-relation":true
            };
            if(_.has(item,"value") && formControls[item.ctype]){
                item["name"]=item["value"];
                delete item["value"];
            }
            var ignores=["value","icon","ctype","name","title","input-type","span","inputType","action","entityName","preprocessor",
                "context","model","showLabel","label","rules","required","error","showMessage",
                "labelFor","labelWidth","initWhenCreate","params"];
            var params=item.params||{};
            _.forIn(item,(v,k)=>{
                if(!_.includes(ignores,k)){
                    params[k]=v;
                }
            });
            item.params=params;
            _item=item;
        }
        //表单上下文都要附加到m-field组件上去
        _item.context=_.extend({},this.fieldContext(),_item.context);
        if(this.batchFieldConvert){
          this.batchFieldConvert(_item);
        }
        //如果是关系，而不是字段，切换成关系控件
        if(this.metaEntity.relations[_item.name]){
            _item.ctype='m-relation';
        }
        return _item;
    },
    handleFormItemChange(itemEvent,formItem){
        this.$emit("on-change",itemEvent,{
            form:this,
            formItem:formItem
        });
    }
  }
}