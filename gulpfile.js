var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  minifyCss = require('gulp-minify-css'),
  coffee = require('gulp-coffee'),
  less = require('gulp-less'),
  rename = require('gulp-rename'),
  gutil = require('gulp-util'),
  concat = require('gulp-concat'),
  // livereload = require('gulp-livereload'),
  path = require("path"),
  appFiles = {
    less: 'local/less/**/*.less',
    coffee: 'local/coffee/**/*.coffee',
    timestamp: 'production/.timestamp',
  };

  vendorFiles = {
    css: [
      'assets-vendor/bootstrap/dist/css/bootstrap.min.css',
      'assets-vendor/fontawesome/css/font-awesome.min.css',
    ],
    js: [
      'assets-vendor/jquery/dist/jquery.min.js',
      'assets-vendor/bootstrap/dist/js/bootstrap.min.js'
    ]
  };


var server = {
  port: 4000,
  livereloadPort: 35729,
  basePath: __dirname,
  _lr: null,
  start: function() {
    var express = require('express');
    var app = express();
    app.use(require('connect-livereload')());
    app.use(express.static(server.basePath));
    app.listen(server.port);
    console.log("Application started at " + server.port);
    console.log("Visit at http://localhost:" + server.port);
  },
  livereload: function() {
    server._lr = require('tiny-lr')();
    server._lr.listen(server.livereloadPort);
  },
  livestart: function() {
    server.start();
    server.livereload();
  },
  notify: function(event) {
    var fileName = path.relative(server.basePath, event.path);
    server._lr.changed({
      body: {
        files: fileName
      }
    });
  }
};

gulp.task('js-libs', function() {
  gulp.src(vendorFiles.js)
  .pipe(concat('vendor.js'))
  .pipe(gulp.dest('production/'));
});

gulp.task('css-libs', function() {
  gulp.src(vendorFiles.css)
  .pipe(concat('vendor.css'))
  .pipe(gulp.dest('production/'));
});
 
gulp.task('watch', function () {
  gulp.watch(['*.html', 'local/less/**/*.less', 'local/coffee/**/*.coffee'], server.notify);
  gulp.watch(appFiles.less, ['less']);
  gulp.watch(appFiles.coffee, ['coffee']);
});

gulp.task('livereload', function(){
  gulp.src('*.html').pipe(server.notify);
});

gulp.task('startserver', ['js-libs', 'css-libs'], function(){
  server.livestart();
});
 
gulp.task('less', function(){
  console.log(appFiles.less);
  gulp.src(appFiles.less)
    .pipe(less().on('error', gutil.log))
    .pipe(concat('pa.css'))
    .pipe(gulp.dest('production/'))
    .pipe(minifyCss().on('error', gutil.log))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('production/'));
 
    require('fs').writeFile(appFiles.timestamp, new Date().getTime());
});
 
gulp.task('coffee', function(){
  gulp.src(appFiles.coffee)
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(concat('pa.js'))
    .pipe(gulp.dest('production/'))
    .pipe(uglify().on('error', gutil.log))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('production/'));
 
    require('fs').writeFile(appFiles.timestamp, new Date().getTime());
});

gulp.task('default', ['startserver', 'watch']);