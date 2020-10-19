import dayjs from 'dayjs';
import { debounceFn } from './debounce';

/**
 * 格式化输出一个moment对象
 * @param {moment} input
 * @return {string}
 */
export const renderMomentDateTime = (input) => {
    return input.format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化输出一个unix time stamp
 * @param {number} input
 * @param {string} defaultValue
 * @return {string}
 */
export const renderUnixTimeStamp = (input, defaultValue = '-') => {
    return input ? renderMomentDateTime(dayjs(input * 1000)) : defaultValue;
};

export const renderBoolean = (value, reverse = false) => {
    if (reverse) {
        return !value ? '是' : '否';
    } else {
        return value ? '是' : '否';
    }
};

export const generatePostData = (data) => {
    return { data: JSON.stringify(data) };
};

export const createDebounce = (func, wait = null) => {
    return debounceFn(func, wait || process.env.VUE_APP_DEB || 500);
};

export const parseInsertResponse = (response) => {
    return response.data.success ? JSON.parse(response.data.message).id : null;
};

export const traverseTree = (tree, parent, nodeCreator, result, leafNodeCreator) => {
    if (result.length === 0) {
        const rootLevel = _.filter(tree, (n) => parent == null ? n.parentId == null : n.parentId === parent.id);
        _.forEach(rootLevel, (node) => {
            const n = nodeCreator(node);
            result.push(n);
            if (node.children) {
                traverseTree(node.children, n, nodeCreator, result, leafNodeCreator);
            } else if (leafNodeCreator) {
                const leafChildren = leafNodeCreator(n);
                if (leafChildren && leafChildren.length > 0) {
                    n.children = leafChildren;
                }
            }
        });
    } else {
        parent.children = [];
        _.forEach(tree, (node) => {
            const n = nodeCreator(node, parent);
            // 把原有的子节点插入到最前面
            parent.children.splice(0, 0, n);
            if (node.children) {
                traverseTree(node.children, n, nodeCreator, result, leafNodeCreator);
            } else if (leafNodeCreator) {
                const leafChildren = leafNodeCreator(n);
                if (leafChildren && leafChildren.length > 0) {
                    n.children = leafChildren;
                }
            }
        });
    }
};

export const getTableColumns = (tableRef) => {
    if (!tableRef) {
        throw new Error('table ref is null');
    }

    const headerWrapper = tableRef.$el.getElementsByClassName('el-table__header-wrapper');
    if (!headerWrapper || headerWrapper.length === 0) {
        throw new Error('can not find "el-table__header-wrapper"');
    }

    const cells = headerWrapper[0].getElementsByClassName('cell');
    const columns = _.map(cells, 'innerText');
    console.log(`get columns: ${columns}`);
    return columns;
};

/**
 * 创建树形结构，每项数据必须有属性：id, parentId
 * @param root 根节点
 * @param all 所有数据
 * @param result 结果
 * @param sortField 排序字段
 */
export const generateTree = (root, all, result, sortField) => {
    if (root == null) {
        root = _.filter(all, n => n.parentId == null);
        if (sortField) {
            root = _.sortBy(root, [sortField]);
        }
        root.forEach(i => {
            i.treePath = [i.id];
            result.push(i);
        });
    }

    _.forEach(root, r => {
        const children = _.filter(all, n => n.parentId === r.id);
        if (children.length > 0) {
            r.children = sortField ? _.sortBy(children, [sortField]) : children;
            r.children.forEach(i => {
                if (r.treePath) {
                    i.treePath = [...r.treePath, i.id];
                } else {
                    i.treePath = [i.id];
                }
            });
        }
        generateTree(children, all, result, sortField);
    });
};

export const walkTree = (tree, currentNodeHandlerFunc) => {
    if (tree == null || !_.isArray(tree)) {
        return;
    }

    for (let n of tree) {
        currentNodeHandlerFunc(n);
        if (n.children) {
            walkTree(n.children, currentNodeHandlerFunc);
        }
    }
};

export const loopTree = (tree, callback) => {
    _.forEach(tree, n => {
        callback(n);
        if (n.children && n.children.length > 0) {
            loopTree(n.children, callback);
        }
    });
};

export const getAbsoluteHeight = (el) => {
    if (!el) {
        return 0;
    }

    const styles = window.getComputedStyle(el);
    const margin = parseFloat(styles['marginTop']) + parseFloat(styles['marginBottom']);
    return Math.ceil(el.offsetHeight + margin);
};

export const getFileBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

export const generateFileJson = async (file) => {
    const fileString = await getFileBase64(file);
    const index = fileString.indexOf('base64,');
    const contentType = fileString.substr(5, index - 'base64,'.length + 1);
    return {
        name: file.name,
        contentType,
        size: file.size,
        content: fileString.substr(index + 'base64,'.length),
    };
};
