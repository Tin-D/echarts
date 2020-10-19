module.exports = {
    configureWebpack: {
        devServer: {
            overlay: {
                warnings: true,
                errors: true,
            },
            proxy: {
                '/api': {
                    target: 'http://127.0.0.1:5005',
                    secure: false,
                    logLevel: 'debug',
                },
            },
        },
    },
};

