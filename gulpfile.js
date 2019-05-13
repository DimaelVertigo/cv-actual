const gulp = require('gulp');
less = require('gulp-less'),
  minifyCss = require('gulp-minify-css'),
  browserSync = require('browser-sync'),
  autoprefixer = require('gulp-autoprefixer'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  notify = require('gulp-notify'),
  spritesmith = require('gulp.spritesmith'),
  babel = require('gulp-babel'),
  babelify = require('babelify'),
  validator = require('gulp-html'),
  fileinclude = require('gulp-file-include');

const paths = {
  src: './src/',
  public: './public/',
  build: './build/',
}

/*==============================
=           Watcher            =
==============================*/
gulp.task('serve', () => {
  browserSync({
    server: {baseDir: paths.public}
  });

  gulp.watch(`${paths.src}*.html`, ['markup']);
  gulp.watch(`${paths.src}images/**/*.{png,svg}`, ['img']);
  gulp.watch(`${paths.src}styles/**/*.less`, ['styles']);
  gulp.watch(`${paths.src}scripts/**/*.js`, ['javascript']);
  gulp.watch(`${paths.src}*.html`).on('change', browserSync.reload);
});

/**
 * Collect all html and send to /public
 */
gulp.task('markup', () => (
  gulp.src(`${paths.src}index.html`)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.public))
));

/**
 * LESS compile
 */
gulp.task('styles', () => (
  gulp.src(`${paths.src}styles/**/styles.less`)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', notify.onError(err => ({
      title: 'Styles',
      message: err.message
    })
    ))
  .pipe(gulp.dest(`${paths.public}styles/`))
  .pipe(browserSync.stream())
));

/**
 * Prepare images to show
 */
gulp.task('img', () => (
  gulp.src(`${paths.src}images/**/*`)
    .pipe(gulp.dest(`${paths.public}images/`))
));


gulp.task('libs', () => (
  gulp.src(`${paths.src}scripts/lib/*.js`)
    .pipe(gulp.dest(`${paths.public}scripts/lib/`))
));

/**
 * Make sprite from .png's
 */
gulp.task('sprite', () => {
  // Use all normal and `-2x` (retina) images as `src`
  //   e.g. `github.png`, `github-2x.png`
  const spriteData = gulp.src(`${paths.src}images/png/**/*.png`)
    .pipe(spritesmith({
      // Filter out `-2x` (retina) images to separate spritesheet
      //   e.g. `github-2x.png`, `twitter-2x.png`
      retinaSrcFilter: `${paths.src}images/png/**/*-2x.png`,
      // Generate a normal and a `-2x` (retina) spritesheet
      imgName: 'sprite-png.png',
      retinaImgName: 'sprite-png-retina.png',
      // Optional path to use in CSS referring to image location
      imgPath: '../images/sprite/sprite-png.png',
      retinaImgPath: '../images/sprite/sprite-png-retina.png',
      // Generate SCSS variables/mixins for both spritesheets
      cssName: 'sprite-png.less'
    }));
// Deliver spritesheets to `dist/` folder as they are completed
spriteData.img.pipe(gulp.dest(`${paths.src}images/sprite/`));
spriteData.img.pipe(gulp.dest(`${paths.public}images/sprite/`));
// Deliver CSS to `./` to be imported by `index.scss`
spriteData.css.pipe(gulp.dest(`${paths.src}/styles/`));
});

/**
 * Prepare javascript to show in browser
 */
gulp.task('javascript', () => (
  gulp.src(`${paths.src}scripts/scripts.js`)

    .pipe(babel({
      presets: ['es2015']
    }))
    .on('error', notify.onError(err => ({
      title: 'JS',
      message: err.message
    })
    ))
  .pipe(gulp.dest(`${paths.public}scripts/`))
  .pipe(browserSync.stream())
));


gulp.task('js', () => (
  gulp.src(`${paths.public}scripts/scripts.js`)
    .pipe(gulp.dest(`${paths.build}scripts/`))
));

gulp.task('jslibs', () => (
  gulp.src(`${paths.src}scripts/lib/*.js`)
    .pipe(gulp.dest(`${paths.build}scripts/lib/`))
));

gulp.task('css', () => (
  gulp.src(`${paths.src}styles/**/styles.less`)
    .pipe(sourcemaps.init())
    .pipe(less())
    .on('error', notify.onError((err) => (
      {
        title: 'Styles',
        message: err.message
      }
    )))
  .pipe(autoprefixer())
  .pipe(minifyCss({compatibility: 'ie11'}))
  .pipe(gulp.dest('./build/styles/'))
  .pipe(browserSync.stream())
));

gulp.task('html', () => (
  gulp.src(`${paths.src}index.html`)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.build))
));

gulp.task('images', () => (
  gulp.src('./src/images/**/*')
  // .pipe(imagemin('2dywIYbcYicKNU11BDeWwgwbkWptRk6g'))
    .pipe(gulp.dest(`${paths.build}images/`))
));

gulp.task('starter', ['markup', 'styles', 'javascript', 'libs', 'img']);
gulp.task('default', ['serve']);
gulp.task('build', ['html', 'css', 'js', 'jslibs', 'images']);

