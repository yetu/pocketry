/*jslint sloppy: true */
"use strict";
var gulp = require('gulp');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var path = require('path');
var karma = require('karma').server;
var bump = require('gulp-bump');
var git = require('gulp-git');
var tag = require('gulp-tag-version');

function build(paths, suffix) {
	var name = 'pocketry';
	if (suffix) {
		name += '-' + suffix;
	}
	return gulp.src(paths).
			pipe(concat(name + '.js')).
			pipe(gulp.dest('dist')).
			pipe(rename(name + '.min.js')).
			pipe(uglify()).
			pipe(gulp.dest('dist'));
}

function test(runOnce, breakOnError) {
	var karmaConfig = 'test/config.js';
	var cfg = {
		configFile: path.join(__dirname, karmaConfig),
		singleRun: runOnce
	};

	// for tdd option run only phantom
	if (runOnce === false) {
		cfg.browsers = ['PhantomJS', 'Chrome'];
	}

	karma.start(cfg, function (exitCode) {
		if (breakOnError) {
			//failed tests make gulp exit
			console.error(exitCode);
			process.exit(exitCode);
		}
	});
}

function bumpVersion(importance){
	gulp.src('./bower.json')
			.pipe(bump({type: importance}))
			.pipe(gulp.dest('./'))
			.pipe(git.commit('Update version: ' + importance))
			.pipe(tag())
			.pipe(git.push('origin', 'master', { args: '--tags' }))

}

gulp.task('dist', function () {
	var paths = [
		'bower_components/eventEmitter/EventEmitter.js',
		'bower_components/eventie/eventie.js',
		'bower_components/get-style-property/get-style-property.js',
		'bower_components/classie/classie.js',
		'bower_components/get-size/get-size.js',
		'bower_components/draggabilly/draggabilly.js',
		'lib/matrix.js',
		'lib/ui.js',
		'lib/layout.js',
		'lib/draggable.js',
		'lib/util.js'];
	build(paths);
	build(['lib/angular_shim.js'].concat(paths), 'angular');
});

gulp.task('test', function () {
	test(true, true);
});

gulp.task('tdd', function () {
	test(false);
});

gulp.task('major', ['dist'], bumpVersion.bind(null, 'major'));
gulp.task('minor', ['dist'], bumpVersion.bind(null, 'minor'));
gulp.task('patch', ['dist'], bumpVersion.bind(null, 'patch'));