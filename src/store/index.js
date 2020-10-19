import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { actionTypes } from '@/store/actionTypes';
import dayjs from 'dayjs';

Vue.use(Vuex);

function renderDateTime (value, defaultValue = null) {
    if (!value) {
        return defaultValue;
    }
    return dayjs(value).format('HH:mm:ss');
};

export default new Vuex.Store({
    state: {
        jobs: [],
        ports: [],
        finishJobs: [],
    },
    mutations: {
        setJobs (state, jobs) {
            state.jobs = jobs;
        },
        setPorts (state, ports) {
            state.ports = ports;
        },
        setFinishJobs (state, finishJobs) {
            state.finishJobs = finishJobs;
        },
    },
    actions: {
        async [actionTypes.listRunningJobs] ({ commit }) {
            const { data } = await axios.get('/job');
            commit('setJobs', data);
        },
        async [actionTypes.voltageEcharts] (store, { id, index }) {
            const { data } = await axios.get(`/job/data_chart/${id}/${index}`);
            const echartData = [];
            data.forEach((i) => {
                i.createTime = renderDateTime(i.createTime);
                i.voltage = (i.voltage / 1000).toFixed(2);
                i.totalVoltage = (i.totalVoltage / 1000).toFixed(2);
                i.averageVoltage = (i.averageVoltage / 1000).toFixed(2);
                const a = {
                    createTime: i.createTime,
                    '电压': i.voltage,
                    '总电压': i.totalVoltage,
                    '平均电压': i.averageVoltage,
                };
                echartData.push(a);
            });
            return echartData;
        },
        async [actionTypes.currentEcharts] (store, { id, index }) {
            const { data } = await axios.get(`/job/data_chart/${id}/${index}`);
            const echartData = [];
            data.forEach((i) => {
                i.createTime = renderDateTime(i.createTime);
                i.electricity = (i.electricity / 1000).toFixed(2);
                const a = {
                    createTime: i.createTime,
                    '电流': i.electricity,
                };
                echartData.push(a);
            });
            return echartData;
        },
        async [actionTypes.saveAndStartJob] ({ dispatch }, job) {
            await axios.post('/job/add', job, { formPost: true });
            await dispatch(actionTypes.listRunningJobs);
        },
        async [actionTypes.stopJob] ({ dispatch }, id) {
            await axios.put(`/job/stop/${id}`, { formPost: true });
            await dispatch(actionTypes.listRunningJobs);
        },
        async [actionTypes.removeJob] ({ dispatch }, id) {
            await axios.delete(`/job/${id}`, { formPost: true });
            await dispatch(actionTypes.listRunningJobs);
        },
        async [actionTypes.listComPorts] ({ commit }) {
            const { data } = await axios.get(`/com_port/list`);
            commit('setPorts', data);
        },
        async [actionTypes.getFinishJobs] ({ commit }) {
            const { data } = await axios.get('/job/get_finish_job');
            commit('setFinishJobs', data);
        },
        [actionTypes.download] (store, { id }) {
            window.open(`${process.env.VUE_APP_BASE_URL || ''}/job/download/${id}`, '_blank');
        },
        async [actionTypes.removeFinishJob] (store, id) {
            await axios.delete(`/job/delete_job/${id}`, { formPost: true });
        },
    },
    modules: {},
});
