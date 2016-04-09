module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['qunit'],
        files: [
            'tests/**/*.js',
            'tests/**/*.html',
            'static/jquery/jquery-1.12.2.min.js',
            'static/script/**/scripts.js'
        ],
        plugins: [
            'karma-qunit',
            'karma-coverage',
            'karma-phantomjs-launcher',
            'karma-html2js-preprocessor'    

        ],
        browsers: ['PhantomJS'],
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {
            '*.js': ['coverage'],
            'tests/**/*.html' : ['html2js']
        }
    });
};