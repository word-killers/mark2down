module.exports = function (grunt) {
    grunt.initConfig({

        qunit: {
            all: ['/templates/test.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['qunit']);
};