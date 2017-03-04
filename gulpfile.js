var gulp = require('gulp');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var connect = require('gulp-connect');
var ngTemplates = require('gulp-ng-templates');
var sourcemaps = require('gulp-sourcemaps');
var headerfooter = require('gulp-headerfooter');
var angularFilesort = require('gulp-angular-filesort')
var nodemon = require('gulp-nodemon');

gulp.task('default', [
    'build','deps',
    'html', 'style','icons', 'images','templates'
    ], function() {

    gulp.watch([
        './app/**/*.js',
        './app/**/*.svg',
        './app/**/*.css',
        './app/**/*.html',
        './views/index.html',
        './lib/*.js'
    ], ['build', 'html', 'icons','images','templates', 'deps']);
});

gulp.task('deploy', [
    'build','deps',
    'html', 'style','icons', 'images','templates','runApp'
    ], function() {

    gulp.watch([
        './app/**/*.js',
        './app/**/*.svg',
        './app/**/*.css',
        './app/**/*.html',
        './views/index.html',
        './lib/*.js'
    ], ['build', 'html', 'icons','images','templates', 'deps', 'runApp']);
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
        'node_modules/moment/moment.js',
        'node_modules/underscore/underscore-min.js',
        'node_modules/angular-moment/angular-moment.min.js',
        'node_modules/satellizer/dist/satellizer.min.js',
        'node_modules/chart.js/dist/Chart.min.js',
        'node_modules/angular-chart.js/dist/angular-chart.min.js'
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
    .pipe(angularFilesort())
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist/'));
});

gulp.task('html', function() {
    return gulp.src([
        './views/index.html',
        './views/google2e73ff4262ee056a.html'
    ])
    .pipe(gulp.dest('./dist/'));
});

gulp.task('icons', function() {
    return gulp.src([
        './app/routes/home/*.svg'
    ])
    .pipe(gulp.dest('./dist/icons/'));
});

gulp.task('images', function() {
    return gulp.src([
        './img/*.jpg',
        './img/*.svg'
    ])
    .pipe(gulp.dest('./dist/img/'));
});



gulp.task('style', function() {
    return gulp.src([
        'node_modules/angular-material/angular-material.min.css',
        'node_modules/angular-material-data-table/dist/md-data-table.min.css',
        './app/routes/login/login.css',
        './app/routes/lineups/lineups.css',
        './app/routes/lineup/lineup.css',
        './app/routes/lineup/diagram.css',
        './app/routes/lineup/print.css',
        './app/routes/lineup/f.jpg',
        './app/routes/players/player.stats.css'

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

gulp.task('runApp', function() {
    nodemon({
        script: 'app.js',
        ext: 'js html',
        env: { 'NODE_ENV': 'development' }
    });
});
