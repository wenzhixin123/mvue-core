<template>
    <Layout>
        <b-childheader v-if="showHeader" :title="header.title" :back-route="backRoute"></b-childheader>
        <Menu  ref="topMenus" v-if="mode=='horizontal'"
               :theme="theme" mode="horizontal"
               :active-name="activeName" @on-select="onMenuSelected">
            <template v-for="level0 in localMenus">
                <template v-if="level0.children&& level0.children.length>0">
                    <Submenu v-if="level0.children&& level0.children.length>0" :key="level0.id" :name="level0.id">
                        <template slot="title">
                            <Icon :type="level0.icon"></Icon>
                            <span>{{level0.title}}</span>
                        </template>
                        <MenuItem v-for="level1 in level0.children" :key="level1.id" :name="level1.id">
                            <span>{{level1.title}}</span>
                        </MenuItem>
                    </Submenu>
                </template>
                <MenuItem v-else :key="level0.id" :name="level0.id">
                    <Icon :type="level0.icon"></Icon>
                    <span>{{level0.title}}</span>
                </MenuItem>
            </template>
        </Menu>
        <Layout class="detail-view">
            <Sider hide-trigger v-if="mode=='vertical'">
                <Menu ref="leftMenus" width="auto" :theme="theme"
                      :active-name="activeName" @on-select="onMenuSelected">
                    <template v-for="level0 in localMenus">
                        <template v-if="level0.children&& level0.children.length>0">
                            <MenuGroup :title="level0.title" :key="level0.id">
                                <template v-for="level1 in level0.children">
                                    <MenuItem :key="level1.id" :name="level1.id">
                                        <Icon :type="level1.icon"></Icon>
                                        <span>{{level1.title}}</span>
                                    </MenuItem>
                                </template>
                            </MenuGroup>
                        </template>
                        <MenuItem v-else :key="level0.id" :name="level0.id">
                            <Icon :type="level0.icon"></Icon>
                            <span>{{level0.title}}</span>
                        </MenuItem>
                    </template>
                </Menu>
            </Sider>
            <Content>
                <Card :bordered="false" class="m-md">
                    <router-view></router-view>
                </Card>
            </Content>
        </Layout>
    </Layout>
</template>

<script>
    import context from "../../libs/context";
    export default {
        props: {
            menus: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            theme:{
                type:String,
                default:"light"
            },
            mode:{
                type:String,
                default:"vertical"
            },
            recordId:{
                type:String,
            },
            entityName:{
                type:String
            },
            showHeader:{
                type:Boolean,
                default:true
            },
            backRoute:{
                type:Object,
                default(){
                    return {
                        path:"../../list"
                    }
                }
            }
        },
        data: function () {
            this.setEntityToContext();
            return {
                isShow: true,
                localMenus: _.cloneDeep(this.menus),
                openNames: [],
                activeName: "",
                menuMappings: {},
                header:{
                    title:"-"
                }
            }
        },
        mounted(){
            this.localMenus = _.cloneDeep(this.menus);
            if(this.localMenus.length<1){
                return;
            }
            this.prepare();
            if(this.$route.name==="defaultEditForm"){
                let lm=this.localMenus[0];
                while(lm.children&&lm.children.length>0){
                    lm=lm.children[0];
                }
                if(lm){
                    this.onMenuSelected(lm.id);
                }
            }
            this.setActiveMenu();
        },
        methods: {
            setActiveMenu() {//设置导航菜单选中
                var url=this.$route.path.substring(this.$route.path.lastIndexOf("/")+1);
                var matched=null;
                this.visitTree(this.localMenus,menu=>{
                    if(menu.url==url){
                        matched=menu;
                        return false;
                    }
                });
                if(matched){
                    this.activeName=matched.id;
                    this.$nextTick(()=> {
                        var menuRef=this.getMenuRef();
                        if(menuRef!=null){
                            menuRef.updateActiveName();
                        }
                    });
                }
            },
            getMenuRef(){
                if(this.mode=="horizontal"){
                    return this.$refs.topMenus;
                }else{
                    return this.$refs.leftMenus;
                }
            },
            setEntityToContext() {
                if(_.isEmpty(this.entityName) || _.isEmpty(this.recordId)){
                    return;
                }
                var metaEntity=this.$metaBase.findMetaEntity(this.entityName);
                var dataResource=metaEntity.dataResource();
                dataResource.get({id: this.recordId}).then(({data})=> {
                    let titleField = metaEntity.firstTitleField();
                    this.header.title=(titleField==null?metaEntity.title:data[titleField.name]);
                    this.$store.commit("core/setEntity",{entityName:this.entityName,entity:data});
                });
            },
            onMenuSelected: function (name) {
                if (name) {
                    var selectedMenu = this.menuMappings[name];
                    if (_.isEmpty(selectedMenu) || _.isEmpty(selectedMenu.url)) {
                        alert("菜单定义数据有误");
                        return;
                    }
                    var toPath=this.$route.path;
                    if(this.$route.name!='defaultEditForm'){
                        toPath=toPath.substring(0,this.$route.path.lastIndexOf("/"));
                    }
                    toPath=toPath+"/"+selectedMenu.url;
                    this.activeName = selectedMenu.id;
                    this.$router.push({path: toPath,query:this.$route.query});
                }
            },
            prepare: function () {
                var _this = this;
                if (!(_this.localMenus && _this.localMenus.length)) {//如果菜单为空
                    return;
                }
                _this.visitTree(_this.localMenus, function (menu) {
                    var menuId = menu.id;
                    if (menu.url&&menu.url.indexOf("#") > 0) {
                        menu["path"] = menu.url.substring(menu.url.indexOf("#") + 1);
                    } else {
                        menu["path"] = "/";
                    }
                    _this.menuMappings[menuId] = menu;
                });
            },
            visitTree: function (tree, processor,parent) {
                var self = this;
                _.forEach(tree, function (node, index) {
                    if(parent && _.isEmpty(node.parentId)){
                        node["parentId"]=parent.id;
                    }
                    if (processor) {
                        var result=processor(node, tree, index);
                        if(result===false){
                            return false;
                        }
                    }
                    if (node.children) {
                        self.visitTree(node.children, processor,node);
                    }
                });
            }
        }
    }
</script>

<style scoped>

</style>