module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['qunit'],
        files: [
            'static/script*.js',
            'static/test.js'
        ],
        plugins: [
            'karma-coverage',
            'karma-phantomjs-launcher'
        ],
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {'*.js': ['coverage']},

        coverageReporter: {
            dir: 'coverage/',
            reporters: [
                {type: 'html', subdir: 'html'},
                {type: 'lcovonly', subdir: 'lcov'},
                {type: 'cobertura', subdir: 'cobertura'}
            ]
        }


    });


};