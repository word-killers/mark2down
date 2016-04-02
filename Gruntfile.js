module.exports = function (grunt) {
    grunt.initConfig({

        qunit: {
            files: [{src: 'templates/test.html'}]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['qunit']);
};