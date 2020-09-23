const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const constants = require('./constants');

const prodConfig = (entryName, zipPathPrefix = '') => ({
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'js/[name].[chunkhash:7].js',
    chunkFilename: 'js/chunk.[id].[chunkhash:7].js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true, // Must be set to true if using source-maps in production
      }),
    ],
  },
  plugins: [
    new LicenseWebpackPlugin({ perChunkOutput: true }),
    new webpack.BannerPlugin({ banner: ` Copyright © ${new Date().getFullYear()} Design By ${constants.author} ` }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [`${entryName}/**/*`]
    }),
    new CopyPlugin([
      { from: constants.publicDir, to: path.join(constants.outDir, entryName) },
    ]),
    new MiniCssExtractPlugin({
      filename: 'css/[contenthash].css',
      chunkFilename: 'css/[contenthash].css',
    }),
    new ZipPlugin({
      path: constants.outDir,
      filename: `${entryName}_${process.env.ENV}.zip`,
      pathPrefix: zipPathPrefix,
    }),
  ],
});

module.exports = prodConfig;

