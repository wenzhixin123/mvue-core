
//已注册的操作
var operations={

};
function register(operations) {
    if(_.isArray(operations)){
        _.forEach(operations,(op)=>{
            registerSingle(op);
        });
    }else{
        registerSingle(operations);
    }
}

function registerSingle(operation) {
    var name=operation.name;
    if(_.isNil(name)){
        console.log("hasn't name ,can't register it ,operation:"+JSON.stringify(operation));
        return;
    }
    operations[name]=operation;
}

function create(opts) {
    if(_.isString(opts)){
        opts={name:opts};
    }
    var name=opts.name;
    if(_.isNil(name)){
        console.log("hasn't name ,can't create it ,opts:"+JSON.stringify(opts));
        return opts;
    }
    var template=operations[name];
    if(_.isEmpty(template)){
        console.log("operation hasn't register,opts:"+JSON.stringify(opts));
        return opts;
    }
    var created=_.assign({},template,opts);

    //根据type重写operationType
    if(_.has(created,"action")){
        created["operationType"]=created["action"];
    }
    return created;
}

export  default {
    /**
     * 注册操作
     * @param operation
     */
    register(operation){
        register(operation);
    },
    /**
     * 使用已注册的操作模板，根据操作参数，构造新的操作实例
     * @param opts
     */
    create(opts){
        return create(opts);
    },
    batchCreate(btns){
        let _btns=[];
        if(!btns){
            return _btns;
        }
        _.each(btns,(btn)=>{
            var opts=btn;
            if(_.isString(btn)){
                opts={name:btn}
            }
            var created=create(opts);
            _btns.push(created);
        });
        return _btns;
    },
    /**
     * 根据名称查询操作
     * @param name
     * @returns {*}
     */
    find(name){
        return operations[name];
    }
}