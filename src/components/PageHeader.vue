<template>
    <h3 class="page-header">
        <i :class="icon"></i> {{ title }}
        <slot/>
    </h3>
</template>

<script>
    import { routes } from '@/router';

    export default {
        watch: {
            '$route': {
                handler () {
                    const titles = [];
                    _.forEach(this.$route.matched, r => {
                        const result = {
                            title: null,
                            icon: null,
                        };
                        this.matchRoute(r.path, '', routes, result);
                        console.log(result);
                        if (result.title) {
                            titles.push(result.title);
                        }

                        if (result.icon) {
                            this.icon = result.icon;
                        }
                    });

                    this.title = titles.join(' / ');
                },
                immediate: true,
            },
        },
        data () {
            return {
                icon: '',
                title: '',
            };
        },
        methods: {
            matchRoute (routePath, parentUrl, rootRoutes, result) {
                if (parentUrl === '/') {
                    return {
                        title: null,
                        icon: null,
                    };
                }

                for (let routeItem of rootRoutes) {
                    const fullPath = parentUrl + (routeItem.path.startsWith('/') ? routeItem.path : `/${routeItem.path}`);
                    if (routePath === fullPath) {
                        result.title = _.isFunction(routeItem.text) ? routeItem.text(this.$route) : routeItem.text;
                        result.icon = routeItem.icon;
                        break;
                    } else if (routeItem.children) {
                        this.matchRoute(routePath, fullPath, routeItem.children, result);
                    }
                }
            },
        },
    };

</script>
