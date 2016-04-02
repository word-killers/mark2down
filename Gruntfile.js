module.exports = function (grunt) {
    grunt.initConfig({

        qunit: {
            all_tests: ['templates/test.html'],
            individual_tests:{
                files: [
                    {src: 'templates/test.html'}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['qunit']);
};