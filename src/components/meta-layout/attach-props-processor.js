function forMetaForm(layout,options){
    let isPopup=options&&options.isPopup;
    _.forEach(layout,lyt=>{
        if(lyt.ctype=="meta-form"&&(!_.has(lyt,"recordId"))){
            if(isPopup){
                lyt.recordId={
                    type:"text",
                    value:{from:"context",key:"selectedId"}
                };
                lyt.transfer=true;
            }else{
                lyt.recordId={
                    type:"text",
                    value:{from:"path",key:"id"}
                };
            }
        }
        if(lyt.ctype=="meta-form"&&(!_.has(lyt,"completedAction"))){
            if(isPopup){
                lyt.completedAction="closePopup";
            }
        }
    });
}
function process(layout,options){
    forMetaForm(layout,options);
}
export default {process};