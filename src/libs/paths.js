function join(...args){
    let paths=[];
    let firstStartsWithSlash=false;
    if(args.length>0){
        firstStartsWithSlash=args[0].startsWith('/');
    }
    for (let el of args) {
        let t=el;
        if(el.endsWith('/')){
            t= el.substr(0,el.length-1);
        }else if(el.startsWith('/')){
            t= el.substr(1,el.length);
        }
        paths.push(t);
    }
    let _path= paths.join('/');
    return firstStartsWithSlash?`/${_path}`:_path;
}
export default {
    join
}