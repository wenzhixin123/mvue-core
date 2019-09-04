import defaultLang from './lang/zh-CN';
import context from '../libs/context';
import Format from './format';

const format = Format();
let lang = defaultLang;
let merged = false;
let i18nHandler = function() {
    let _Vue=context.getVue();
    let currentVue=context.getCurrentVue();
    currentVue=this || currentVue;
    const vuei18n = Object.getPrototypeOf(currentVue).$t;
    if (typeof vuei18n === 'function'){
        return vuei18n.apply(currentVue, arguments);
    }
};

export const t = function(path, options) {
    //没有使用vue-i18n组件时value为undefined
    let value = i18nHandler.apply(this, arguments);
    if (value !== null && value !== undefined) return value;
    //没有使用vue-i18n组件时，使用默认的Format
    const array = path.split('.');
    let current = lang;

    for (let i = 0, j = array.length; i < j; i++) {
        const property = array[i];
        value = current[property];
        if (i === j - 1) return format(value, options);
        if (!value) return '';
        current = value;
    }
    return '';
};

export const use = function(l) {
    lang = l || lang;
};

export const merge = function(l) {
    lang = _.merge({},lang,l);
};

export const i18n = function(fn) {
    i18nHandler = fn || i18nHandler;
};

export default { use, t, i18n, merge };