import topEntityService from "../../services/store/top-entity";

/**
 * 用于处理topEntity的设置以及清理
 */
export default {
    init(router,appCtx){
        if(router&&appCtx&&appCtx.getStore){
            router.beforeEach(function(to, from, next) {
                let store=appCtx.getStore();
                let needRedirect=false;
                let newRoute={
                    query:_.cloneDeep(to.query),
                    hash:_.cloneDeep(to.hash),
                    path:to.path
                }
                //TODO 后续再优化，先全部通过path跳转
                /*if(to.name){
                    newRoute.name=to.name;
                    newRoute.params=_.cloneDeep(to.params);
                }else if(to.path){
                    newRoute.path=to.path;
                }*/
                if(store){
                    //用来标记不同的页面会话
                    let sid=store.getters['core/getSid']();
                    if(!sid){
                        sid=from.query._sid;
                    }
                    //请求第一次带着_sid过来，这时候应该是打开新的浏览器tab，需要从历史_sid中复制topEntity历史
                    if(!sid){
                        sid=to.query._sid;
                        if(sid){
                            //用新的sid覆盖旧的sid
                            sid=topEntityService.copyAndSetFromSid(sid);
                        }
                    }
                    if(sid){
                        newRoute.query._sid=sid;
                        let fp=to.fullPath;
                        if(fp.indexOf('?')>0){
                            let q=fp.substring(fp.indexOf('?'));
                            if(q.indexOf('_sid=')<0){
                                needRedirect=true;
                            }
                        }else{
                            needRedirect=true;
                        }
                    }
                    //每次进到路由时先清空当前路由的状态数据
                    store.commit('core/clearCurrentRouteData');
                    //访问模式参数附加
                    if(to.query["x_access_mode"]){
                        store.commit('core/setAccessMode',to.query["x_access_mode"]);
                    }
                    //如果url显示包含topEntity设置，设置到页面会话中
                    if(to.query["x_top_entity_row"]){
                        topEntityService.setByString(to.query["x_top_entity_row"]);
                    }
                    //如果地址来自导航，清理所有topEntity数据
                    let clearSidArray=['left','top'];
                    let fromQuery=to.query._from;
                    let clear=false;
                    if(fromQuery){
                        fromQuery=fromQuery.split(',');
                        _.each(fromQuery,f=>{
                            if(_.includes(clearSidArray,f)){
                                clear=true;
                                return false;
                            }
                        })
                    }
                    if(clear||_.has(to.query,"_clearSid")){
                        needRedirect=false;
                        topEntityService.removeCurrent();
                    }
                }
                if(needRedirect){
                    next(newRoute);
                }else{
                    next();
                }
            });
        }
    }
}
