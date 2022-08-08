/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */

import * as path from 'path';

import { Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import { ConsoleRemotePlugin } from '@openshift-console/dynamic-plugin-sdk-webpack';

interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const svgToMiniDataURI = require('mini-svg-data-uri');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const KUBEVIRT_PLUGIN_PORT = process.env.KUBEVIRT_PLUGIN_PORT || 9001;

const config: Configuration = {
  mode: 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name]-bundle.js',
    chunkFilename: '[name]-chunk.js',
  },
  devServer: {
    hot: true,
    port: KUBEVIRT_PLUGIN_PORT,
    // Allow bridge running in a container to connect to the plugin dev server.
    allowedHosts: 'all',
    client: {
      progress: true,
      webSocketURL: {
        port: KUBEVIRT_PLUGIN_PORT,
      },
    },
    devMiddleware: {
      writeToDisk: true,
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
    },
  },
  resolve: {
    modules: [path.join(__dirname, 'node_modules')],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    plugins: [new TsconfigPathsPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules\/(?!(@kubevirt-ui)\/kubevirt-api).*/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules\/(?!(@patternfly|@openshift-console\/plugin-shared)\/).*/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sassOptions: {
                outputStyle: 'compressed',
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        oneOf: [
          {
            test: /\.svg$/,
            type: 'asset/inline',
            generator: {
              dataUrl: (content: { toString: () => any }) => {
                return svgToMiniDataURI(content.toString());
              },
            },
          },
          {
            test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
            type: 'asset/resource',
            generator: {
              filename: 'assets/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ConsoleRemotePlugin(),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.resolve(__dirname, 'tsconfig.json'),
        memoryLimit: 4096,
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
      },
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: path.resolve(__dirname, 'locales'), to: 'locales' }],
    }),
  ],
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  config.output.filename = '[name]-bundle-[hash].min.js';
  config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  config.optimization.chunkIds = 'deterministic';
  config.optimization.minimize = true;
}

export default config;
