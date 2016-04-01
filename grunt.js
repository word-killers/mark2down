module.exports =function (grunt) {
    grunt.initConfig({
        qunit: {
            files: ['/templates/test.html']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-qunit');
    
    grunt.registerTask('test', 'lint qunit');
};