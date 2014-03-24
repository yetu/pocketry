var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('dist', function() {
	return gulp.src('lib/*.js').
		pipe(concat('pocketry.js')).
		pipe(gulp.dest('dist')).
		pipe(rename('pocketry.min.js')).
		pipe(uglify()).
		pipe(gulp.dest('dist'));
});
