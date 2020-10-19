/**
 * 配置axios，
 * 1. 支持401自动跳转到登录页
 * 2. 自动增加URL前缀 /api
 * 3. 自动提示错误和成功
 */

import axios from 'axios/index';
import router from '@/router';
import { alertError } from '@/roadhog/alert';
import { Message } from 'element-ui';

const getResponseErrorMessage = (response) => {
    if (_.isString(response.data)) {
        return response.data;
    } else if (_.isString(response.data.message)) {
        return response.data.message;
    } else {
        return '未知错误';
    }
};

axios.defaults.headers['X-Requested-With'] = 'XMLHttpRequest';
if (process.env.VUE_APP_BASE_URL) {
    axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
}

axios.interceptors.response.use(
    (response) => {
        if (response.status === 200 && response.config.formPost && response.config.formPost.success !== false) {
            if (response.data.success === false) {
                Message.error(`操作失败(${response.data.code})：${response.data.message}`);
            } else {
                Message.success(response.config.formPost !== true ? response.config.formPost : '操作成功');
            }
        }
        return response;
    },
    (error) => {
        if (error.message === 'Network Error') {
            Message.error('网络错误');
        } else if (error.response.status === 401 && !_.endsWith(error.config.url, '/current_user')) {
            router.push('/login');
            // location.href = '/#/login';
        } else if (error.response.status === 500) {
            const errorHandler = error.config.errorHandler;
            let errorMessage = null;

            if (errorHandler) {
                errorMessage = errorHandler(error.response);
            }

            if (errorMessage === false) {
                return;
            }

            errorMessage = errorMessage || getResponseErrorMessage(error.response);
            console.log(errorMessage);

            if (error.config.formPost) {
                if (error.config.formPost.error !== false) {
                    alertError(errorMessage);
                }
            } else {
                Message.error(errorMessage);
            }
        } else if (error.response.status === 405) {
            alertError(`${error.response.statusText}\n method: ${error.config.method}`);
        }
        return Promise.reject(error);
    },
);
