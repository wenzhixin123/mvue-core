<template>
    <Layout class="detail-view" :class="containerCls">
        <b-childheader v-if="showHeader" :title="header.title"></b-childheader>
        <Menu  ref="topMenus" v-if="mode=='horizontal'"
               :theme="theme" mode="horizontal"
               :active-name="activeName" @on-select="onMenuSelected">
            <template v-for="level0 in localMenus">
                <Submenu v-if="level0.children&& level0.children.length>0" :key="level0.id" :name="level0.id">
                    <template slot="title">
                        <Icon v-if="level0.icon" :type="level0.icon"></Icon>
                        <span>{{level0.title}}</span>
                    </template>
                    <MenuItem v-for="level1 in level0.children" :key="level1.id" :name="level1.id">
                        <span>{{level1.title}}</span>
                    </MenuItem>
                </Submenu>
                <MenuItem v-else :key="level0.id" :name="level0.id">
                    <Icon v-if="level0.icon" :type="level0.icon"></Icon>
                    <span>{{level0.title}}</span>
                </MenuItem>
            </template>
        </Menu>
        <Layout>
            <Sider hide-trigger v-if="mode=='vertical'" :width="siderWidth">
                <Menu ref="leftMenus" width="auto" :theme="theme"
                      :open-names="openNames" :active-name="activeName" @on-select="onMenuSelected">
                    <template v-for="level0 in localMenus">
                        <Submenu v-if="level0.children&& level0.children.length>0" :key="level0.id" :name="level0.id">
                            <template slot="title">
                                <Icon v-if="level0.icon" :type="level0.icon"></Icon>
                                <span>{{level0.title}}</span>
                            </template>
                            <MenuItem v-for="level1 in level0.children" :key="level1.id" :name="level1.id">
                                <span>{{level1.title}}</span>
                            </MenuItem>
                        </Submenu>
                        <MenuItem v-else :key="level0.id" :name="level0.id">
                            <Icon v-if="level0.icon" :type="level0.icon"></Icon>
                            <span>{{level0.title}}</span>
                        </MenuItem>
                    </template>
                </Menu>
            </Sider>
            <Content>
                <Card :bordered="false" :class="marginCls">
                    <router-view></router-view>
                </Card>
            </Content>
        </Layout>
    </Layout>
</template>

<script>
    import context from "../../libs/context";
    import  paths from "../../libs/paths";
    var pathToRegexp = require('path-to-regexp');

    export default {
        props: {
            menus: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            theme: {
                type: String,
                default: "light"
            },
            mode: {
                type: String,
                default: "vertical"
            },
            recordId: {
                type: String,
            },
            entityName: {
                type: String
            },
            showHeader: {
                type: Boolean,
                default: true
            },
            siderWidth:{
                type:Number,
                default:160
            },
            title:{
                type:String,
                default:"-"
            }
        },
        data: function () {
            this.setEntityToContext();
            let opens=[];
            _.forEach(this.menus,menu=>{
                opens.push(menu.id);
            });
            return {
                isShow: true,
                localMenus: _.cloneDeep(this.menus),
                openNames: opens,
                activeName: "",
                menuMappings: {},
                header: {
                    title: this.title
                },
                basePath: ""
            }
        },
        computed: {
            marginCls() {
                if (this.mode == 'vertical') {
                    return 'm-md';
                }
                if (this.mode == "horizontal") {
                    return 'has-horizontal-menu';
                }
                return ""
            },
            containerCls() {
                if (this.mode == 'vertical') {
                    return 'detail-view-vertical';
                }
                if (this.mode == "horizontal") {
                    return 'detail-view-horizontal';
                }
                return ""
            },
            backRoute() {
                return '';
                //return {path: paths.relativeToAbsolute(this.basePath, "../../list")}
            }
        },
        mounted() {
            this.localMenus = _.cloneDeep(this.menus);
            if (this.localMenus.length < 1) {
                return;
            }
            this.prepare();
            let routeInfo=this.calComponentInRoute();
            let matchedMenu = this.getMatchedMenu();
            if (matchedMenu == null && routeInfo.index==this.$route.matched.length-1) {
                let lm = this.localMenus[0];
                while (lm.children && lm.children.length > 0) {
                    lm = lm.children[0];
                }
                if (lm) {
                    this.onMenuSelected(lm.id);
                }
            }
            this.setActiveMenu(matchedMenu);
        },
        methods: {
            calComponentInRoute() {
                var routeInfo = context.componentInRouteInfo(this);
                if (!routeInfo) {
                    this.basePath = this.$route.path;
                }
                var url = pathToRegexp.compile(routeInfo.route.path)(this.$route.params);
                this.basePath = url;
                return routeInfo;
            },
            setActiveMenu(matched) {//设置导航菜单选中
                if (!matched) {
                    matched = this.getMatchedMenu();
                }
                if (matched) {
                    this.activeName = matched.id;
                    this.$nextTick(() => {
                        var menuRef = this.getMenuRef();
                        if (menuRef != null) {
                            menuRef.updateActiveName();
                        }
                    });
                }
            },
            getMatchedMenu() {
                let url = this.$route.path;
                let matched = null;
                this.visitTree(this.localMenus, menu => {
                    if(!menu.url){
                        return;
                    }
                    var menuUrl = paths.relativeToAbsolute(this.basePath, menu.url);
                    if (url.indexOf(menuUrl) > -1) {
                        matched = menu;
                        return false;
                    }
                });
                return matched;
            },
            getMenuRef() {
                if (this.mode == "horizontal") {
                    return this.$refs.topMenus;
                } else {
                    return this.$refs.leftMenus;
                }
            },
            setEntityToContext() {
                if (_.isEmpty(this.entityName) || _.isEmpty(this.recordId)) {
                    return;
                }
                var metaEntity = this.$metaBase.findMetaEntity(this.entityName);
                var dataResource = metaEntity.dataResource();
                dataResource.get({id: this.recordId}).then(({data}) => {
                    let titleField = metaEntity.firstTitleField();
                    this.header.title = (titleField == null ? metaEntity.title : data[titleField.name]);
                    this.$store.commit("core/setEntity", {entityName: this.entityName, entity: data});
                });
            },
            onMenuSelected: function (name) {
                if (name) {
                    var selectedMenu = this.menuMappings[name];
                    if (_.isEmpty(selectedMenu) || _.isEmpty(selectedMenu.url)) {
                        alert("菜单定义数据有误");
                        return;
                    }
                    var toPath = paths.relativeToAbsolute(this.basePath, selectedMenu.url);
                    this.activeName = selectedMenu.id;
                    if(selectedMenu.redirect){

                    }
                    //这里全部修改为replace为true，菜单切换不作为回退历史记录
                    //if(replace){
                        this.$router.replace({path: toPath, query: this.$route.query});
                    //}else{
                    //    this.$router.push({path: toPath, query: this.$route.query});
                    //}
                }
            },
            prepare: function () {
                var _this = this;
                if (!(_this.localMenus && _this.localMenus.length)) {//如果菜单为空
                    return;
                }
                _this.visitTree(_this.localMenus, function (menu) {
                    var menuId = menu.id;
                    if (menu.url && menu.url.indexOf("#") > 0) {
                        menu["path"] = menu.url.substring(menu.url.indexOf("#") + 1);
                    } else {
                        menu["path"] = "/";
                    }
                    _this.menuMappings[menuId] = menu;
                });
            },
            visitTree: function (tree, processor, parent) {
                var self = this;
                _.forEach(tree, function (node, index) {
                    if (parent && _.isEmpty(node.parentId)) {
                        node["parentId"] = parent.id;
                    }
                    if (processor) {
                        var result = processor(node, tree, index);
                        if (result === false) {
                            return false;
                        }
                    }
                    if (node.children) {
                        self.visitTree(node.children, processor, node);
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>