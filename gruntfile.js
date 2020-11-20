module.exports = function(grunt) {
  grunt.initConfig({
    // ...
    pkg: grunt.file.readJSON('package.json'),
    watch: {
        options: {
            livereload: true
        },
        livereload: {
            files: ['**/*.html', '**/*.css', '**/*.js']
        }
    }
    // ...
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    // add all tasks you need including watch
    'watch'
  ]);
}
