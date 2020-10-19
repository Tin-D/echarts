<template>
    <div id="app">
        <el-container style="height: 100%">
            <el-header class="header">
                <top/>
            </el-header>
            <el-container>
                <el-aside class="pageLeft">
                    <left :root-menu="routes"/>
                </el-aside>
                <el-main class="main-view">
                    <router-view/>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    import Top from '@/components/Top';
    import Left from '@/components/Left';
    import { routes } from '@/router';

    export default {
        components: { Top, Left },
        data () {
            return {
                routes,
            };
        },
    };
</script>
