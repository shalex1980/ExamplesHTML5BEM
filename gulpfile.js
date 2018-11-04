
const gulp = require('gulp');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const rigger = require('gulp-rigger');
const sass = require('gulp-sass');
const sourcemap = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const plumber = require('gulp-plumber');
const prefixer = require('gulp-autoprefixer');
const notify = require('gulp-notify');
const cache = require('gulp-cache');
const cssmin = require('gulp-cssmin');
const concat = require('gulp-concat');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

const path = {
  public: {
    html: 'public/',
    js: 'public/js/',
    style: 'public/css/',
    img: 'public/images/',
    fonts: 'public/fonts'
  },
  src: {
    html: 'src/*.html',
    js: 'src/**/*.js',
    style: 'src/*.scss',
    img: 'src/images/**/*.+(jpg|png)',
    fonts: 'src/fonts/**/*.*'
  },
  watch: {
    html: 'src/**/*.html',
    js: 'src/**/*.js',
    style: 'src/**/*.scss',
    img: 'src/images/**/*.+(jpg|png)',
    fonts: 'src/fonts/**/*.*'
  }
}

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: 'public/'
    }
  })
});

gulp.task('html', function(){
  return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.public.html))
    .pipe(browserSync.stream())
});

gulp.task('style', function() {
  return gulp.src(path.src.style)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemap.init())
    .pipe(sass({errLogToConsole: true}))
    .pipe(prefixer())
    .pipe(gulp.dest(path.public.style))
    .pipe(browserSync.stream())
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.public.style))
});

gulp.task('js', function() {
  return gulp.src(path.src.js)
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(rigger())
    .pipe(sourcemap.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(path.public.js))
    .pipe(browserSync.stream())
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(path.public.js))
});

gulp.task('img', function(){
  return gulp.src(path.src.img)
    .pipe(cache(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()],
      interlaced: true
      })))
      .pipe(gulp.dest(path.public.img))
      .pipe(browserSync.stream());
});

gulp.task('fonts', function() {
  return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.public.fonts))
});

gulp.task('build',['html','style','js','img','fonts']);

gulp.task('watch', function() {
  watch([path.watch.html], function() {
    gulp.start('html')
  });
  watch([path.watch.style], function() {
    gulp.start('style')
  });
  watch([path.watch.js], function() {
    gulp.start('js')
  });
  watch([path.watch.img], function() {
    gulp.start('img')
  });
  watch([path.watch.fonts], function() {
    gulp.start('fonts')
  });
});

gulp.task('default', ['build', 'server', 'watch']);

