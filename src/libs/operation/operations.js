
//已注册的操作
var operations={

};
function register(operations) {
    if(!operations){
        return;
    }
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
    if(!_.has(operation,"type")){
        operation["type"]="common";
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
    if(template.security===true){
        created.security=[created.name];
    }
    if(created["entitySecurity"]===true && !_.isEmpty(opts["entityName"])){
        buildEntitySecurity(created,opts["entityName"]);
    }

    //根据type重写operationType
    if(_.has(created,"type")){
        created["operationType"]=created["type"];
    }
    return created;
}

function buildEntitySecurity(op,entityName){
    var security=[];
    _.forEach(op.security,(sec)=>{
        security.push(`${entityName}:${sec}`);
    });
    op.security=security;
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
    batchCreate(btns,ops){
        let _btns=[];
        if(!btns){
            return _btns;
        }
        var beforeCreate=null;
        var onCreated=null;
        if(ops){
            if(ops.onCreated){
                onCreated=ops.onCreated;
                delete ops.onCreated;
            }
            if(ops.beforeCreate){
                beforeCreate=ops.beforeCreate;
                delete ops.beforeCreate;
            }
        }
        _.each(btns,(btn)=>{
            var opts=btn;
            if(_.isString(btn)){
                opts={name:btn}
            }
            if(ops){
                opts=_.assign(opts,ops);
            }
            if(beforeCreate){
                beforeCreate(opts);
            }
            var created=create(opts);
            if(onCreated){
                onCreated(created);
            }
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