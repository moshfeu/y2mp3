const config = require('./webpack.config');

config.watch = false;
config.mode = 'production';

module.exports = config;