import context from "../context";

/**
 * 用于处理页面级缓存数据
 */
export default {
    init(router,appCtx){
        router.beforeEach(function(to, from, next) {
            context.resetPageCache();
            next();
        });
    }
}
