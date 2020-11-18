const { merge } = require('webpack-merge');
const webpack = require('webpack')
const path = require('path')
const static_files = 'airsift/static'
const bundle_dir = path.join(static_files, 'webpack_bundles/')
const publicPath = 'http://0.0.0.0:3000/' + bundle_dir

/** @type {import('webpack').Configuration} */
const config = merge(require('./webpack.config.base'), {
  mode: "development",
  output: {
    publicPath
  },
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 200,
    poll: 1000
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    publicPath,
    hot: true,
    inline: true,
    historyApiFallback: true,
    allowedHosts: ['*'],
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
})

module.exports = config
