var gulp = require('gulp');
var gutil = require('gulp-util');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var nodemon = require('gulp-nodemon');
var jasmine = require('gulp-jasmine');

var serverjsFiles = ['*.js', 'server/**/*.js'];
var clientjsFiles = ['client/**/*.js', '!client/lib/**/*.js'];
var testFiles = ['*.js', 'spec/**/*.js'];

gulp.task('clientstyle', function () {
    return gulp.src(clientjsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish',
            {
                verbose: true
            }))
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('serverstyle', function () {
    return gulp.src(serverjsFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish',
            {
                verbose: true
            }))
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('serve', ['clientstyle', 'serverstyle', 'jasmine', 'serverwatch', 'clientwatch'], function () {
    var options = {
        script: 'server/app.js',
        delayTime: 1
    };
    return nodemon(options)
        .on('restart', function (ev) {
            console.log('Restarting...');
        });
});

gulp.task('clientwatch', function () {
    gulp.watch(serverjsFiles, ['jasmine', 'clientstyle']);
});

gulp.task('serverwatch', function () {
    gulp.watch(clientjsFiles, ['jasmine', 'serverstyle']);
});

gulp.task('jasmine', function () {
    gulp.src('server/spec/**/*.js')
        .pipe(jasmine({ verbose: true, includeStackTrace: true }));
});

