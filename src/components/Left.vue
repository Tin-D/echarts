<template>
    <div>
        <el-menu ref="menus"
                 :router="true"
                 unique-opened
                 :default-active="currentActive"
                 :default-openeds="defaultOpenNodes"
                 background-color="transparent"
                 text-color="#000"
                 active-text-color="#0160B0"
        >
            <template v-for="m of menus">
                <el-submenu v-if="m.children && m.children.length > 0" :index="m.index" :key="m.index">
                    <template slot="title">
                        <i :class="m.icon"></i><span style="margin-left: 10px;">{{ m.text }}</span>
                    </template>
                    <el-menu-item v-for="c in m.children" :index="c.index" :key="c.index" class="submenu" >
                        <i :class="c.icon"></i><span style="">{{ c.text }}</span>
                    </el-menu-item>
                </el-submenu>

                <el-menu-item v-else :index="m.index" :key="m.index">
                    <i :class="m.icon"></i><span style="margin-left: 10px;">{{ m.text }}</span>
                </el-menu-item>

            </template>
        </el-menu>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { checkRole } from '@/router';

    export default {
        data () {
            return {
                menus: [],
                menusList: [],
                defaultOpenNodes: [],
                currentActive: null,
            };
        },
        watch: {
            rootMenu: {
                handler (newValue) {
                    this.menusList = [];
                    for (let routeItem of newValue) {
                        let menu = this.formatMenu(routeItem);
                        menu.index = this.rootPrefix + menu.path;
                        this.menusList.push(menu);

                        if (menu.isSubMenu) {
                            menu.children = [];
                            for (let subRouteItem of routeItem.children) {
                                let subMenu = this.formatMenu(subRouteItem);
                                subMenu.index = menu.index + '/' + subMenu.path;
                                this.menusList.push(subMenu);
                                if (subMenu.display) {
                                    menu.children.push(subMenu);
                                }
                            }
                        }
                        if (menu.display) {
                            this.menus.push(menu);
                        }
                        if (menu.children && menu.children.length > 0) {
                            // this.defaultOpenNodes.push(this.rootPrefix + menu.path);
                        }
                    }
                },
                immediate: true,
            },
            $route: {
                handler (newValue) {
                    const matchedRoute = _.maxBy(newValue.matched, (n) => n.path.length);
                    if (matchedRoute == null) {
                        return;
                    }
                    console.log('matchedRoute' + matchedRoute.path);

                    // 这里分两种情况
                    // 1. 优先匹配完全一样的URL
                    // 2. 不能完全匹配的，匹配最短的

                    const allFit = this.menusList.find(n => n.index === matchedRoute.path);
                    if (allFit == null) {
                        console.log('no menu index fit: ' + matchedRoute.path);
                        return;
                    }

                    if (allFit.index.indexOf('/:') > -1) {
                        this.currentActive = allFit.index.substr(0, allFit.index.indexOf('/:'));
                        console.log('fit current active menu(first param) ' + this.currentActive);
                    } else {
                        this.currentActive = allFit.index;
                        console.log('fit current active menu(equals) ' + this.currentActive);
                    }
                },
                immediate: true,
            },
        },
        computed: {
            ...mapState({
                mainHeight: (state) => state.global.mainHeight,
            }),
        },
        methods: {
            formatMenu (routeItem) {
                // 先检测有没有直接设置display属性
                let display = _.isFunction(routeItem.display) ? routeItem.display(this.currentUser) : (routeItem.display == null ? true : routeItem.display);

                // 然后检测这个菜单是否可以匿名访问
                let auth = true;
                if (routeItem.meta && routeItem.meta.auth) {
                    if (routeItem.meta.auth === true) {
                        auth = this.currentUser != null;
                    } else if (_.isFunction(routeItem.meta.auth)) {
                        auth = routeItem.meta.auth(this.currentUser);
                    }
                }

                // 检测权限
                let hasRole = true;
                if (routeItem.meta) {
                    hasRole = checkRole(this.currentUser, routeItem.meta.role);
                }

                if (!hasRole) {
                    console.log(`role check failed: ${routeItem.path}`);
                }

                display = (routeItem.component || routeItem.children != null) && routeItem.text && display && auth && hasRole;

                let text = _.isFunction(routeItem.text) ? routeItem.text() : routeItem.text;
                return {
                    text,
                    icon: routeItem.icon,
                    path: routeItem.path,
                    isSubMenu: routeItem.children != null,
                    display,
                };
            },
        },
        props: {
            rootMenu: {
                type: Array,
                required: true,
            },
            rootPrefix: {
                type: String,
                default: '',
            },
        },
    };
</script>
