module.exports = require('babel-jest').createTransformer({
  presets: [
    ['@babel/preset-env', {
      debug: false,
      loose: true,
      targets: {
        node: true,
      },
    }],
    ['@babel/preset-typescript', {isTSX: false}],
  ],
});
