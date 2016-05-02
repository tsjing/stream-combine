/**
 * Created by hilkeheremans on 02/02/16.
 */

var babel = require('babel-core');

var babelConfig = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '.babelrc.wallaby')));
babelConfig.babel = babel;

module.exports = function (wallaby) {
  return {
    files: ['src/**/*.js','config/**/*.json5',{ pattern: 'src/**/*.spec.js', ignore: true }],
    tests: ['src/**/*.spec.js'],
    compilers: {
      '**/*.js': wallaby.compilers.babel(babelConfig)
    },
    env: {
      type: 'node'
    }
  };
};
