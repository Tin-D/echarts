import axios from 'axios';

const isEmpty = (value) => {
    if (value == null) {
        return true;
    }

    if (_.isBoolean(value)) {
        return !value;
    }

    if (_.isString(value) && _.trim(value) === '') {
        return true;
    }

    return _.isObject(value) ? _.isEmpty(value) : false;
};

const specialChars = ['/', '\\', '?', ':', '*', '?', '>', '<', '|'];

// 依赖于另外字段必填，例子：validators.required.bind(this)({ onlyIf: 'enableCron', formProperty: 'configs' }),
const onlyIfRequired = (onlyIf, component, formProperty, message, trigger) => {
    let checker = null;

    if (_.isString(onlyIf)) {
        checker = (form) => !isEmpty(form[onlyIf]);
    } else if (_.isFunction(onlyIf)) {
        checker = (form, fieldValue) => onlyIf.bind(form)(fieldValue, form);
    } else {
        throw new Error('onlyIf can be string or function, but received: ' + typeof (onlyIf));
    }

    return {
        validator (rule, value, callback) {
            let form = component[formProperty];
            let errors = [];
            if (form == null) {
                throw new Error('can not find form: ' + formProperty);
            }
            if (isEmpty(value) && checker(form, value)) {
                errors.push(message);
            }
            callback(errors);
        },
        trigger,
    };
};

export const required = function (options) {
    options = options || {};
    let {
        onlyIf = null,
        message = '必填项',
        formProperty = 'form',
        trigger = 'blur',
        type = 'string',
    } = options;

    // eslint-disable-next-line no-invalid-this
    return onlyIf ? onlyIfRequired(onlyIf, this, formProperty, message, trigger) : {
        required: true,
        message,
        trigger,
        type,
    };
};

export const ip = function (message = '不是一个有效的IP地址') {
    return {
        message: message,
        pattern: /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/,
    };
};

export const mac = function (message = '不是一个有效的MAC地址') {
    return {
        message: message,
        pattern: /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/i,
    };
};

export const url = function (message = '不是一个合法的URL') {
    return {
        message: message,
        type: 'url',
    };
};

export const email = function (message = '不是一个合法的Email地址') {
    return {
        message: message,
        type: 'email',
    };
};

export const noSpecialChar = function (message = '有非法字符') {
    return {
        validator (rule, value, callback) {
            for (let c of specialChars) {
                if (value.includes(c)) {
                    callback(message);
                    return;
                }
            }
            callback();
        },
        trigger: 'blur',
    };
};

// eslint-disable-next-line camelcase
export const equal_to = function (component, options) {
    options = options || {};

    let {
        field,
        message,
        formProperty = 'form',
        trigger = 'blur',
        type = 'string',
    } = options;

    // eslint-disable-next-line no-invalid-this
    message = message || `不等于 ${field}`;

    return {
        validator (rule, value, callback) {
            const errors = [];
            if (!isEmpty(value) && value !== component[formProperty][field]) {
                errors.push(message);
            }
            callback(errors);
        },
        trigger,
        type,
        message,
    };
};

export const equal = function (otherValue, message) {
    message = message || `不等于 ${otherValue}`;

    return {
        validator (rule, value, callback) {
            const errors = [];
            if (value !== otherValue) {
                errors.push(message);
            }
            callback(errors);
        },
    };
};

export const validateAsync = (validFunc, message = '该名称已经被使用') => {
    if (!_.isFunction(validFunc)) {
        throw new Error('validFunc is not a function');
    }
    return {
        async validator (rule, value, callback) {
            const success = await validFunc(value);
            if (success) {
                callback();
            } else {
                callback(message);
            }
        },
        trigger: 'blur',
    };
};

export const isNumber = (message = '必须是一个数字') => {
    return {
        message,
        pattern: /^(?![0.]+$)\d+(\.\d{1,5})?$/,
    };
};

export const isFloat = (message = '必须是一个数字') => {
    return {
        validator (rule, value, callback) {
            const errors = [];
            if (!isEmpty(value) && !/^[+-]?\d+(\.\d+)?$/.test(value.toString())) {
                errors.push(message);
            }
            callback(errors);
        },
    };
};

export const isInt = (message = '必须是一个整数') => {
    return {
        message,
        pattern: /^\d+$/,
    };
};

export const passwordValidator = () => {
    return {
        async validator (rule, value, callback) {
            if (!value) {
                callback();
                return;
            }

            const { data } = await axios.post('/validate_password', value);
            if (data.success) {
                callback();
            } else {
                callback(data.message);
            }
        },
        trigger: 'blur',
    };
};
