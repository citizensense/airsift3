const path = require('path')
const static_files = './airsift/static'
const bundle_dir = path.join(static_files, 'webpack_bundles/')
const BundleTracker = require('webpack-bundle-tracker');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
  context: __dirname,
  entry: path.join(__dirname, static_files, "index.tsx"),
  output: {
    path: path.join(__dirname, bundle_dir),
    filename: "[name]-[hash].js"
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.css']
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleTracker({ filename: path.join(bundle_dir, 'webpack-stats.json') }),
    new MiniCssExtractPlugin({
      filename: '[name]-[hash].css',
    }),
  ],
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
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-css-variables')(),
                  require('tailwindcss')(path.resolve(__dirname, './tailwind.config.js')),
                  require('postcss-nested')(),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
};
