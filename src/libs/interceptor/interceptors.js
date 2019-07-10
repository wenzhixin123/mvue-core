import pageCacheInterceptor from "./page-cache-interceptor";
import topEntityInterceptor from "./top-entity-interceptor";
/**
 * 注册所有拦截器
 */
export default {
    register(router,appCtx){
        pageCacheInterceptor.init(router,appCtx);
        topEntityInterceptor.init(router,appCtx);
    }
}
