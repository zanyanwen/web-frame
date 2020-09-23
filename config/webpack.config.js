const path = require('path');
const webpack = require('webpack');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const safeArea = require('postcss-safe-area');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const merge = require('webpack-merge');
const constants = require('./constants');
const { env } = require('../package.json');

const isDev = constants.nodeEnv !== 'production';
const NODE_ENV = constants.nodeEnv; // js 环境
const ENV = constants.env; // 项目环境
const analyze = Boolean(process.env.ANALYZE);

const styleLoader = isDev
  ? 'style-loader'
  : {
      loader: MiniCssExtractPlugin.loader,
      options: { publicPath: '../' },
    };

const postcssPlugins = [
  autoprefixer(),
  safeArea(),
  pxtorem({
    rootValue: 100,
    propList: ['*'],
  }),
];

const config = {
  context: constants.appRoot,
  resolve: {
    alias: {
      '@': constants.appDir,
    },
    extensions: ['.jsx', '.js', '.json', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.jsx?$/i,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.less$/i,
            exclude: /node_modules/,
            use: [
              styleLoader,
              {
                loader: 'css-loader',
                options: {
                  importLoaders: 2,
                  modules: {
                    localIdentName: isDev ? '[path][name][local]___[hash:base64:5]' : '[hash:base64]',
                  },
                },
              },
              {
                loader: 'less-loader',
                options: {
                  modifyVars: constants.theme,
                  javascriptEnabled: true,
                },
              },
              {
                loader: 'postcss-loader',
                options: {
                  plugins: postcssPlugins,
                },
              },
            ],
          },
          {
            test: /\.svg$/,
            issuer: {
              test: /\.jsx?$/i,
            },
            loader: '@svgr/webpack',
          },
          {
            test: /\.(jpg|png|jpe?g|gif|bmp|svg)$/i,
            loader: 'url-loader',
            options: {
              limit: 409600, // 400k
              name: 'assets/[contenthash].[ext]',
              publicPath: isDev ? './' : '../',
            },
          },
          //  antd
          {
            test: /\.css$/,
            include: /node_modules/,
            use: [styleLoader, 'css-loader'],
          },
          {
            test: /\.less$/i,
            include: /node_modules/,
            use: [
              styleLoader,
              'css-loader',
              {
                loader: 'postcss-loader',
                options: {
                  plugins: postcssPlugins,
                },
              },
              {
                loader: 'less-loader',
                options: {
                  modifyVars: constants.theme,
                  javascriptEnabled: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        ENV: JSON.stringify(ENV),
        ...Object.keys(env).reduce((re, ke) => {
          re[ke] = JSON.stringify(env[ke][constants.env]);
          return re;
        }, {}),
      },
    }),
    new MomentLocalesPlugin({
      localesToKeep: ['zh-cn'],
    }),
    new HtmlPlugin({
      template: path.resolve(constants.appDir, 'template.html'),
    }),
    analyze && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
};

const walletConfig = merge(
  {
    entry: path.resolve(constants.cwd, 'src/index.jsx'),
    output: {
      path: path.join(constants.outDir, 'wallet'),
    },
  },
  config,
  isDev ? require('./webpack.dev')('wallet') : require('./webpack.prod')('wallet', 'www'),
);
const mallConfig = merge(
  {
    entry: path.resolve(constants.cwd, 'mall/index.jsx'),
    output: {
      path: path.join(constants.outDir, 'mall'),
    },
  },
  config,
  isDev ? require('./webpack.dev')('mall') : require('./webpack.prod')('mall'),
);

module.exports = [walletConfig];
