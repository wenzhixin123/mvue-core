
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
    if((!name)||(name&&!operations[name])){
        name="custom";
    }
    var template=operations[name];
    var created=_.assign({},template,opts);
    if(template.security===true){
        created.security=[created.name];
    }
    if(created["entitySecurity"]===true && !_.isEmpty(opts["entityName"])){
        buildEntitySecurity(created,opts["entityName"]);
    }

    //根据type重写operationType
    if(_.has(created,"type")&& !_.has(created,'operationType')){
        created["operationType"]=created["type"];
    }
    return created;
}

function buildEntitySecurity(op,entityName){
    var security=[];
    var hasBuilt=false;//表示是否构建过了，比如说两次调用create导致权限实体前缀拼接多次
    _.forEach(op.security,(sec)=>{
        if(sec.indexOf(':')>0){
            hasBuilt=true;
            return false;
        }
        security.push(`${entityName}:${sec}`);
    });
    if(!hasBuilt){
        op.security=security;
    }
}
//只要操作定义了selectedItem=one或者multi，就执行此逻辑
function onBuild(inst) {
    if(inst.selectedItem=="one"){
        inst["disabled"]=function (ctx) {
            return !(ctx.selectedItems && ctx.selectedItems.length ==1);
        }
    }else if(inst.selectedItem=="multi"){
        inst["disabled"]=function (ctx) {
            return !(ctx.selectedItems && ctx.selectedItems.length >0);
        }
    }
}

function buildByTemplate(opts) {
    if(_.isEmpty(opts.name) || _.isEmpty(opts.type)){
        var error="operation must has name and type property:"+JSON.stringify(opts);
        throw Error(error);
    }
    var name=opts.name;
    //对于template定义的模板操作，需要特殊处理
    if(opts.type=="routeTo"){
        opts.name=opts.type;
        delete opts.type;
    }
    var created=create(opts);
    created.name=name;
    if(created.selectedItem=="one"||created.selectedItem=="multi"){
        onBuild(created);
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
     * 根据模板Operation生成新的Operation，并注册
     * @param ops
     */
    registerByTpl(opts){
        var created=buildByTemplate(opts);
        register(created);
        return created;
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
            //entityName以操作btn上定义的优先，opts上定义的不覆盖
            if(opts.entityName&&ops&&ops.entityName){
                let __ops=_.cloneDeep(ops);
                delete __ops.entityName;
                opts=_.assign(opts,__ops);
            }else if(ops){
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
