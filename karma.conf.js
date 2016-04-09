module.exports = function (config) {
    config.set({
        basePath: '',
        autoWatch: true,
        frameworks: ['qunit'],
        files: [
            'tests/**/*.js',
            'tests/**/*.html',
            'static/jquery/jquery-1.12.2.min.js',
            'static/script/**/scripts.js'
        ],
        plugins: [
            'karma-coverage',
            'karma-qunit',
            'karma-phantomjs-launcher',
            'karma-html2js-preprocessor'

        ],
        browsers: ['PhantomJS'],
        reporters: ['progress', 'coverage'],
        preprocessors: {
            '*.js': ['coverage'],
            'tests/**/*.html': ['html2js']
        },
        singleRun: true,

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