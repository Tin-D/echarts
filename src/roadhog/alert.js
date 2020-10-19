import { MessageBox } from 'element-ui';

export const confirmDialog = ({ message = '确定要删除项目', itemName }) => {
    return MessageBox.confirm(`${message} ${itemName ? `'${itemName}'` : ''} ?`, '确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    });
};

export const alertError = (message) => {
    return MessageBox.alert(message, {
        title: '错误',
        confirmButtonText: '确定',
        type: 'error',
        closeOnPressEscape: true,
        showClose: false,
    });
};

export const alertMessage = (message, dangerouslyUseHTMLString = false) => {
    return MessageBox.alert(message, {
        title: '消息',
        confirmButtonText: '确定',
        type: 'success',
        dangerouslyUseHTMLString,
    });
};
