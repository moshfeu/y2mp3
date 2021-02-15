const config = require('./webpack.config');

module.exports = (...args) => ({
  ...config(...args),
  watch: false,
  mode: 'production',
});
