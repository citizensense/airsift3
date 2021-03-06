const { mergeWithCustomize, customizeArray } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path')

/** @type {import('webpack').Configuration} */
const config = mergeWithCustomize({
  customizeArray: customizeArray({
    "module.rules.*": "replace"
  })
})(require('./webpack.config.base'), {
  mode: "production",
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
        ]
      },
      {
        test: /global.css$/i,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-css-variables')(),
                  require('tailwindcss')(path.resolve(__dirname, './tailwind.config.js')),
                  require('postcss-nested')(),
                  require('autoprefixer'),
                  require('postcss-preset-env'),
                  require('cssnano')({ preset: 'default' })
                ],
              },
            },
          },
        ],
      },
    ],
  },
})

module.exports = config
