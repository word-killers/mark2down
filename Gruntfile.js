module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-qunit');

    gruntConfig.qunit = {
        src: ['templates/test.html']
    };

    grunt.registerTask('test', ['qunit:src']);
    grunt.registerTask('travis', ['lint', 'test']);
};