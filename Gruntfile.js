module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-build-info');
    grunt.loadNpmTasks('grunt-codecov.io');

    grunt.initConfig({
        qunit: {
            urls: {
                options: {
                    urls: [
                        'https://mark2down.herokuapp.com/test'
                    ]
                }
            }
        },

        codecov_io: {
            option: { },
            files: {
                'dest/default_options': ['templates/test']
            }
        }
    });

    grunt.registerTask('test', ['qunit']);
};