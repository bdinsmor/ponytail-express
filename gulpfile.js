var gulp = require('gulp');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var ngTemplates = require('gulp-ng-templates');
var sourcemaps = require('gulp-sourcemaps');
var headerfooter = require('gulp-headerfooter');

gulp.task('default', [
    'build','deps',
    'html', 'style','icons', 'templates'
    ], function() {

    gulp.watch([
        './app/**/*.js',
        './app/**/*.svg',
        './app/**/*.css',
        './app/**/*.html',
        './views/index.html',
        './lib/*.js'
    ], ['build', 'html', 'icons','templates', 'deps']);
});


gulp.task('deps', function() {
    return gulp.src([
        'node_modules/@angular/router/angular1/angular_1_router.js',
        'node_modules/angular-animate/angular-animate.min.js',
        'node_modules/angular-aria/angular-aria.min.js',
        'node_modules/angular-messages/angular-messages.min.js',
        'node_modules/angular-material/angular-material.min.js',
        'node_modules/angular-material-data-table/dist/md-data-table.min.js',
        'node_modules/angular-sortable-view/src/angular-sortable-view.min.js',
        'node_modules/angular-material-icons/angular-material-icons.min.js',
        'node_modules/moment/moment.min.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('dependencies.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build', function() {
    return gulp.src([
        './app/**/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    //.pipe(headerfooter.header("(function() {\n"))
    //.pipe(headerfooter.footer("}());\n"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('html', function() {
    return gulp.src([
        './views/index.html'
    ])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('icons', function() {
    return gulp.src([
        './app/routes/home/*.svg'
    ])
    .pipe(gulp.dest('./dist/icons/'));
});

gulp.task('style', function() {
    return gulp.src([
        'node_modules/angular-material/angular-material.min.css',
        'node_modules/angular-material-data-table/dist/md-data-table.min.css',
        './app/routes/home/home.css',
        './app/routes/home/diagram.css',
        './app/routes/home/print.css',
        './app/routes/home/f.jpg'

    ])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('connect', function() {
  connect.server({
    root: 'dist',
    port: 8080
  });
});

gulp.task('templates', function () {
    return gulp.src([
        'app/**/**.html'
    ])
    .pipe(ngTemplates({
        filename: 'templates.js',
        module: 'app.templates',
        path: function (path, base) {
            return path.replace(base, '');
        }
    }))
    .pipe(gulp.dest('./dist/'));
});
