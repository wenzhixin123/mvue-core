import noneWidgetModeCommonOperation from '../grid/js/metagrid_operation';//widgetMode false
export default {
    methods:{
        getCommonOpt(name){//根据通用操作的name，返回具体的操作，包括onclick函数等
            let commonOpt=noneWidgetModeCommonOperation.createOperation(name);
            return commonOpt;
        },
        convertToCommonOptIfNeeded(btns){//将通过属性传递的toolbar中的通用操作简写方式（只写了name），转成具体的操作对象（包含onclick函数等）
            let _btns=[];
            if(!btns){
                return _btns;
            }
            _.each(btns,(btn)=>{
                if(_.isString(btn)){
                    let newBtn={
                        name:btn,
                        operationType:"common"
                    };
                    let commonOpt=this.getCommonOpt(btn);
                    if(commonOpt){
                        _btns.push(Object.assign(newBtn,commonOpt));
                    }else{
                        _btns.push(newBtn);
                    }
                }else{
                    _btns.push(btn);
                }
            });
            return _btns;
        }
    }
}