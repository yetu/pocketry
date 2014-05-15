/*jslint sloppy: true */
module.exports = function (config) {
  config.set({
    basePath: '../',
    frameworks: ['jasmine'],
    browsers: ['Chrome', 'PhantomJS'],
    autoWatch: true,

    files: [
      {pattern: 'bower_components/**/*.js', watched: false, server: true, included: true},
      'lib/matrix.js',
      {pattern: 'test/**/*.spec.js'}
    ],

    reportSlowerThan: 500
  });
};