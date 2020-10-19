import Vue from 'vue';
import VueRouter from 'vue-router';
import RunningJob from '@/components/job/RunningJob';
import FinishJob from '@/components/finish/Index';

Vue.use(VueRouter);

export const checkRole = (currentUser, needRoles) => {
    if (currentUser == null) {
        return false;
    }

    if (needRoles == null) {
        return true;
    }

    if (_.isFunction(needRoles)) {
        return needRoles(currentUser);
    }

    if (_.isString(needRoles)) {
        needRoles = [needRoles];
    }

    const result = _.intersection(_.map(currentUser.groups, 'code'), needRoles).length > 0;
    console.log(`need role: ${needRoles}, ${result}`);
    return result;
};

export const routes = [
    {
        path: '/',
        redirect: '/running',
    },
    {
        path: '/running',
        text: '正在运行',
        component: RunningJob,
        icon: 'el-icon-set-up',
    },
    {
        path: '/finished',
        text: '已完成',
        component: FinishJob,
        icon: 'el-icon-document-checked',
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
