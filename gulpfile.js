var gulp = require('gulp');
less = require('gulp-less'),
	path = require('path'),
	minifyCss = require('gulp-minify-css'),
	browserSync = require('browser-sync'),
	gutil = require('gulp-util'),
	autoprefixer = require('gulp-autoprefixer'),
	svgsprites = require('gulp-svg-sprite'),
	sourcemaps = require('gulp-sourcemaps'),
	imagemin = require('gulp-tinypng'),
	imageResize = require('gulp-image-resize'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	notify = require('gulp-notify'),
	sftp = require('gulp-sftp'),
	ftp = require('gulp-ftp'),
	spritesmith = require('gulp.spritesmith'),
	eslint = require('gulp-eslint'),
	babel = require('gulp-babel'),
	browserify = require('gulp-browserify'),
	jsx = require('gulp-jsx'),
	babelify = require('babelify');

/*==============================
=           Watcher            =
==============================*/
gulp.task('watch', function () {
  browserSync.init({
    proxy: 'localhost:8888'
  });
	gulp.watch('./src/*.html', ['markup']);
	gulp.watch('./src/images/**/*.{png,svg}', ['images']);
	gulp.watch('./src/styles/**/*.less', ['styles']);
	gulp.watch('./src/scripts/**/*.js', ['javascript']);
	// gulp.watch("./img/svg/**/*.svg", ['svgsprites']);
	gulp.watch('./public/*.html').on('change', browserSync.reload);
});

/*============================
=            HTML            =
============================*/
gulp.task('markup', function () {
	return gulp.src('./src/*.html')
		.pipe(gulp.dest('./public/'));
});

/*============================
=            Images            =
============================*/
gulp.task('images', function () {
	return gulp.src('./src/images/sprite/*.{svg,png}')
		.pipe(gulp.dest('./public/images/sprite/'));
});

/*=============================================
=            LESS and autoprefixer            =
=============================================*/
gulp.task('styles', function () {
	return gulp.src('./src/styles/**/styles.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.on('error', notify.onError(function (err) {
			return {
				title: 'Styles',
				message: err.message
			};
		}))
		.pipe(autoprefixer())
		.pipe(gulp.dest('./public/styles/'))
		.pipe(browserSync.stream());
});

/*==================================
=            JavaScript            =
==================================*/
gulp.task('javascript', function () {
	return gulp.src('./src/scripts/**/scripts.js')
    .pipe(browserify({
      debug: true,
      transform: [babelify.configure({presets: ['es2015', 'import-export']})]
    }))
    .on('error', onError)
		.pipe(babel({
			presets: ['es2015']
		}))
		.on('error', onError)
		.pipe(gulp.dest('./public/scripts/'))
		.pipe(browserSync.stream());
});

function onError(err) {
	console.log(err);
	this.emit('end');
	notify.onError(function (err) {
		return {
			title: 'Styles',
			message: err.message
		};
	});
};

gulp.task('minify', ['less'], function () {
	return gulp.src('./css/*.css')
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./css/min/'));
});

gulp.task('babel', function () {
	return gulp.src('src/app.js')
		.pipe(babel())
		.pipe(gulp.dest('dist'));
});

gulp.task('gulp-autoprefixer', ['less'], function () {
	return gulp.src('./css/style.css')
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(gulp.dest('dist'));
});

/*===========================
=            SVG            =
===========================*/
gulp.task('svgsprites', function () {
	gulp.src('./src/images/svg/**/*.svg')
		.pipe(svgsprites({
			shape: {
				dimension: {
					maxWidth: 32,
					maxHeight: 32,
					precision: 2
					//attributes: false
				}
			},
			mode: {
				symbol: {
					bust: false,
					sprite: 'inline-sprite.svg'
				}
			}
		}))
		.pipe(gulp.dest('./src/images/sprite'))
		.pipe(notify({
			message: 'SVG-sprite ready'
		}));
});

gulp.task('svgspriteless', function () {
	gulp.src('./src/images/svg/**/*.svg')
		.pipe(svgsprites({
			shape: {
				spacing: {
					padding: 1
				}
			},
			svg: {             // General options for created SVG files
				namespaceIDs: true,           // Add namespace token to all IDs in SVG shapes
				namespaceClassnames: true          // Add namespace token to all CSS class names in SVG shapes
			},
			mode: {
				css: {
					prefix: '.sprite-%s',
					dimensions: '%s',
					dest: './',
					sprite: './images/sprite/sprite-svg.svg',
					bust: false,
					render: {
						less: {
							dest: './styles/sprite-svg.less'
						}
					}
				}
			}
		}))
		.pipe(gulp.dest('./src/'))
		.pipe(notify({
			message: 'SVG-sprite ready'
		}));
});
/*==================================
=            PNG sprite            =
==================================*/
gulp.task('sprite', function generateSpritesheets() {
	// Use all normal and `-2x` (retina) images as `src`
	//   e.g. `github.png`, `github-2x.png`
	var spriteData = gulp.src('./src/images/png/**/*.png')
		.pipe(spritesmith({
			// Filter out `-2x` (retina) images to separate spritesheet
			//   e.g. `github-2x.png`, `twitter-2x.png`
			retinaSrcFilter: './src/images/png/**/*-2x.png',
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
	spriteData.img.pipe(gulp.dest('./src/images/sprite/'));
	spriteData.img.pipe(gulp.dest('./public/images/sprite/'));
	// Deliver CSS to `./` to be imported by `index.scss`
	spriteData.css.pipe(gulp.dest('./src/styles/'));
});




/*==============================================================
=            Concatination and minification sctipts            =
==============================================================*/
gulp.task('scripts', function () {
	return gulp.src(['./src/scripts/lib/*.js'], ['./src/scripts/*.js'])
		.pipe(concat('all.js'))
    .pipe(uglify())
		.pipe(gulp.dest('./public/scripts/'))
		.pipe(notify({
			title: 'JavaScript',
			message: 'Finished minifying scripts'
		}));
});

gulp.task('default', ['watch']);
