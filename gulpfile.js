var gulp = require('gulp'),
    // jshint = require('gulp-jshint'),
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    nodemon = require('gulp-nodemon');
    // webserver = require('gulp-webserver');

// gulp.task('js', function() {
//   return gulp.src('builds/sassEssentials/js/myscript.js')
//     .pipe(jshint('./.jshintrc'))
//     .pipe(jshint.reporter('jshint-stylish'));
// });

gulp.task('sass', function () {
    return sass('sass/style.scss', {
      sourcemap: true,
      style: 'expanded'
    })
    .on('error', function (err) {
        console.error('Error!', err.message);
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  // gulp.watch('builds/sassEssentials/js/**/*', ['js']);
  gulp.watch(['sass/**/*'], ['sass']);
});

gulp.task('start', function () {
  nodemon({
    script: 'app.js', 
    ext: 'js html', 
    env: { 'NODE_ENV': 'development' }
  });
});

// gulp.task('webserver', function() {
//     gulp.src('builds/sassEssentials/')
//         .pipe(webserver({
//             livereload: true,
//             open: true
//         }));
// });

// gulp.task('default', ['sass', 'watch', 'webserver']);
// gulp.task('default', ['sass', 'watch']);
gulp.task('default', ['sass', 'watch', 'start']);
