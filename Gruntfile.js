module.exports = function (grunt) {
    grunt.initConfig({
        pkg: qrunt.file.readJSON('package.json'),

        qunit: {
            files: ['/templates/test.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.registerTask('test', ['lint', 'qunit']);
};