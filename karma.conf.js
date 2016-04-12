module.exports = function (config) {
    config.set({
        basePath: 'static/script',
        autoWatch: true,
        frameworks: ['qunit'],
        files: [
            '../jquery/jquery-1.12.2.min.js',
            '../jquery/jquery-ui-1.11.4/jquery-ui.min.js',
            '../keyvent.min.js',
            '../../tests/*.js',
            '../../tests/*.html',
            'scripts.js'
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
            '../../tests/*.html': ['html2js']
        },
        singleRun: true,

        coverageReporter: {
            dir: '../../coverage/',
            reporters: [
                {type: 'html', subdir: 'html'},
                {type: 'lcovonly', subdir: 'lcov'},
                {type: 'cobertura', subdir: 'cobertura'}
            ]
        }
    });
};