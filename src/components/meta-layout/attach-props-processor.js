function forMetaForm(layout,options){
    let isPopup=options&&options.isPopup;
    _.forEach(layout,lyt=>{
        let isMForm=lyt.ctype=="meta-form"||lyt.ctype=="m-form";
        if(isMForm&&(!_.has(lyt,"recordId"))){
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
        if(isMForm&&(!_.has(lyt,"completedAction"))){
            if(isPopup){
                lyt.completedAction="close";
            }
        }
    });
}
function process(layout,options){
    forMetaForm(layout,options);
}
export default {process};