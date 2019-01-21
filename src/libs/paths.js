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
function relativeToAbsolute(base, relative) {
    //make sure base ends with /
    if (base[base.length - 1] != '/')
        base += '/';

    //base: https://server/relative/subfolder/
    //url: https://server
    let url = base.substr(0, base.indexOf('/', base.indexOf('//') + 2));
    //baseServerRelative: /relative/subfolder/
    let baseServerRelative = base.substr(base.indexOf('/', base.indexOf('//') + 2));
    if (relative.indexOf('/') === 0)//relative is server relative
        url += relative;
    else if (relative.indexOf("://") > 0)//relative is a full url, ignore base.
        url = relative;
    else {
        while (relative.indexOf('../') === 0) {
            //remove ../ from relative
            relative = relative.substring(3);
            //remove one part from baseServerRelative. /relative/subfolder/ -> /relative/
            if (baseServerRelative !== '/') {
                let lastPartIndex = baseServerRelative.lastIndexOf('/', baseServerRelative.length - 2);
                baseServerRelative = baseServerRelative.substring(0, lastPartIndex + 1);
            }
        }
        url += baseServerRelative + relative;//relative is a relative to base.
    }

    return url;
}
export default {
    join,
    relativeToAbsolute
}