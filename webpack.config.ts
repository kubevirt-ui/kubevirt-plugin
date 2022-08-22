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
const CopyPlugin = require('copy-webpack-plugin');
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
        exclude:
          /node_modules\/(?!(@patternfly|@openshift-console\/plugin-shared|@openshift-console\/dynamic-plugin-sdk)\/).*/,
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
              dataUrl: (content) => {
                content = content.toString();
                return svgToMiniDataURI(content);
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
    new CopyPlugin({
      patterns: [{ from: '../locales', to: '../dist/locales' }],
    }),
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
  ],
  devtool: 'source-map',
  optimization: {
    chunkIds: 'named',
    minimize: false,
  },
};

if (process.env.NODE_ENV === 'production') {
  config.mode = 'production';
  if (config.output) {
    config.output.filename = '[name]-bundle-[hash].min.js';
    config.output.chunkFilename = '[name]-chunk-[chunkhash].min.js';
  }
  if (config.optimization) {
    config.optimization.chunkIds = 'deterministic';
    config.optimization.minimize = true;
  }
}

export default config;
