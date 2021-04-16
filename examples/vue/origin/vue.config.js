const { resolve } = require('path');

const resolveAbsolute = dir => resolve(__dirname, dir);

module.exports = {
  devServer: {
    host: 'localhost',
    port: '8000'
  },
  configureWebpack: {
    resolve: {
      alias: {
        'seance': resolveAbsolute('../../../lib/index.js'),
      }
    }
  }
};
