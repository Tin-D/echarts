/* eslint-disable */
// Debounced promise:
// Like lodash.debounce, but multiple calls to a debounced function
// will return the same promise so that they will be notified when the debounced function returns
//
// In case the deboucned value is a promise, the last promise value shall be returned.
export function debounceFn(fn, timeout) {
    const context = this;
    let timer = undefined;
    let resPromise = undefined;
    let resolver = undefined;
    let rejector = undefined;
    return (...args) => {
        if (timer) {
            // Cancel previous call
            console.log('Debounced!');
            clearTimeout(timer);
        }

        // Use native Promise as a defer object
        resPromise = resPromise || new Promise((_resolver, _rejector) => {
            resolver = _resolver;
            rejector = _rejector;
        });

        timer = setTimeout(() => {
            const invokingTimer = timer;
            // There is a case that when the return value of the function is a promise,
            // we should resolve to the last invoking one instead
            const shouldProceed = () => invokingTimer === timer;
            console.log('Invoking debounce func', fn);
            // In case fn returns a Promise,
            // we wrap it with resolve to make it compatible with a normal function return value
            const _fn = () => {
                try {
                    return Promise.resolve(fn.apply(context, args));
                } catch (err) {
                    return Promise.reject(err);
                }
            };
            _fn().then(res => {
                if (shouldProceed()) {
                    resolver(res);
                }
            }, err => {
                if (shouldProceed()) {
                    rejector(err);
                }
            }).then(() => {
                if (shouldProceed()) {
                    // Release resources
                    resPromise = undefined;
                    resolver = undefined;
                    rejector = undefined;
                    timer = undefined;
                }
            });
        }, timeout);
        return resPromise;
    };
}
