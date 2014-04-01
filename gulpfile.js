var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('dist', function() {
	var paths = ['lib/ui.js', 'lib/layout.js', 'lib/draggable.js'];
	build(paths);
	build(['lib/angular_shim.js'].concat(paths), 'angular');
});

function build(paths, suffix) {
	var name = 'pocketry';
	if(suffix) {
		name += '-' + suffix;
	}
	gulp.src(paths).
		pipe(concat(name + '.js')).
		pipe(gulp.dest('dist')).
		pipe(rename(name + '.min.js')).
		pipe(uglify()).
		pipe(gulp.dest('dist'));
}
