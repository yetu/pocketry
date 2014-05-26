/*jslint sloppy: true */
module.exports = function (config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    browsers: ['Chrome', 'PhantomJS'],
    autoWatch: true,

    files: [
      'bower_components/lodash/dist/lodash.js',
      'bower_components/jqlite/jqlite.min.js',
      'lib/matrix.js',
      'lib/ui.js',
      'lib/layout.js',
      {pattern: 'test/**/*.spec.js'}
    ],
    exclude : [
      'bower_components/**/test/*.js'
    ],

    reportSlowerThan: 500
  });
};