module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-qunit');

    grunt.initConfig({
        qunit: {
            urls: {
                options: {
                    urls: [
                        'https://mark2down.herokuapp.com/test'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', ['qunit']);
};