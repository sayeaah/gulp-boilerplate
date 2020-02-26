const settings = {
  server: true,
  styles: true,
  pug: true,
  scripts: true
};

const paths = {
  server: "dist/",
  input: "src/",
  ouput: "dist/",
  styles: {
    input: "src/scss/main.scss",
    output: "dist/css"
  },
  pug: {
    input: "src/pug/pages/*.pug",
    output: "dist/pages",
    base: "src/pug/pages"
  },
  scripts: {
    input: "src/js/**/*.js",
    output: "dist/js"
  }
};
const { gulp, src, dest, watch, series, parallel } = require("gulp");
const rename = require("gulp-rename");

// scss -> css
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const prefix = require("autoprefixer");
const minify = require("cssnano");

// pug -> html
const pug = require("gulp-pug");

//server
const browserSync = require("browser-sync");

//scripts
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

//lint scripts
const lintScripts = function(done) {
  if (!settings.scripts) return done();

  return src(paths.scripts.input)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

//build scripts
const buildScripts = function(done) {
  if (!settings.scripts) return done();

  return src(paths.scripts.input)
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(dest(paths.scripts.output));
};

// build scss files
const buildStyles = function(done) {
  // Not run this function if false in settings
  if (!settings.styles) return done();

  return src(paths.styles.input)
    .pipe(sass())
    .pipe(postcss([prefix()]))
    .pipe(dest(paths.styles.output))
    .pipe(rename({ suffix: ".min" }))
    .pipe(
      postcss([
        minify({
          discardComments: {
            removeAll: true
          }
        })
      ])
    )
    .pipe(dest(paths.styles.output));
};

// build pug files
const buildPug = function(done) {
  // Not run this function if false in settings
  if (!settings.pug) return done();

  return src(paths.pug.input, { base: "src/pug/pages" })
  .pipe(pug())
  .pipe(
    rename({
      extname: ".html"
    })
  )
  .pipe(dest(paths.pug.output));
};

//start server
const startServer = function (done) {
  if (!settings.server) return done();

  browserSync.init({
    server: {
      baseDir: paths.server
    }
  });

  done();
};

// Watch for changes to the src directory
const reloadBrowser = function (done) {
  if (!settings.server) return done();
  browserSync.reload();
  done();
};

// Watch for changes
const watchSource = function(done) {
  watch(paths.input, series(exports.default, reloadBrowser));
  done();
};

//run `gulp`
exports.default = series(
  parallel(
    buildStyles, 
    buildPug,
    lintScripts,
    buildScripts
));

//run `gulp watch`
exports.watch = series(
  exports.default,
  startServer,
  watchSource
);