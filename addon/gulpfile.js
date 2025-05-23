'use strict';

var gulp   = require('gulp'),
    eslint = require('gulp-eslint'),
    sass   = require('gulp-sass')(require('sass')),
    zip    = require('gulp-zip');

var sources = {
  js: [
    'src/**/*.js'
  ],
  sass: [
    'src/options/bootstrap.scss',
    'src/options/options.scss'
  ],
  watch: {
    sass: [
      'src/**/*.scss'
    ]
  },
  dist: [
    'src/**'
  ]
};

function watchFiles () {
  gulp.watch(sources.js, lintTask);
  
  // Other sass files import these, so build them when these change.
  gulp.watch(sources.watch.sass, sassTask);
}

function sassTask () {
  return gulp.src(sources.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

function lintTask () {
  return gulp.src(sources.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function distTask () {
  return gulp.src(sources.dist)
    .pipe(zip('comfyui-liebs-toast.zip', {
      compress: false
    }))
    .pipe(gulp.dest('dist'));
}

exports.sass = sassTask;
exports.lint = lintTask;

exports.watch = gulp.series(sassTask, watchFiles);
exports.default = gulp.series(lintTask, watchFiles);
exports.dist = gulp.series(lintTask, sassTask, distTask);
