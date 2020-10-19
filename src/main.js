import Vue from 'vue';
import 'lodash';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/web.scss';
import './roadhog/axiosConfig';
import App from './App.vue';
import router from './router';
import store from './store';
import VCharts from 'v-charts';

Vue.use(VCharts);
Vue.config.productionTip = false;
Vue.use(ElementUI, { size: 'small' });

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
