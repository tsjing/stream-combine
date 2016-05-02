/**
 * Created by hilkeheremans on 03/07/15.
 */

var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var changed = require('gulp-changed')
var concat = require("gulp-concat");
var del = require('del');
var watch = require('gulp-watch');
var print = require('gulp-print')
var flow = require('gulp-flowtype');
var sourcemapReporter = require('jshint-sourcemap-reporter');

gulp.task("build", function () {
    return gulp.src(['src/**/*.js'])
        .pipe(changed("lib"))
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write(".", {
            includeContent: false,
            sourceRoot: __dirname+'/src'
        }))
        .pipe(flow({
            all: false,
            weak: false,
            killFlow: false,
            beep: true,
            abort: false,
            reporter: {
                reporter: function(errors) {
                    return sourcemapReporter.reporter(errors, { sourceRoot: '/' + src + '/' });
                }
            }
        }))
        .pipe(gulp.dest("lib"));
});

gulp.task("json", function() {
        return gulp.src('src/**/*.json')
            .pipe(changed('lib'))
            .pipe(gulp.dest('lib'));
})

gulp.task('clean', function(cb) {
    "use strict";
    del([
        'lib/**/*'
    ], cb);
})

// default gulp task
gulp.task('default', ['build', 'json'], function() {
});