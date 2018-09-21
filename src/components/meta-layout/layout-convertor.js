function convertSettings(_settings){
    //对于只有一个组件的情况，自动转换为一列一行的布局
    if(_settings.ctype){
        return {
            layout:[_settings]
        };
    }else{
        return _settings;
    }
}
export default {convert:convertSettings};