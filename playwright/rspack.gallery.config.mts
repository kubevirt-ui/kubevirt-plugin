import path from 'path';
import { fileURLToPath } from 'url';

import { Configuration, DefinePlugin, HtmlRspackPlugin, ProvidePlugin } from '@rspack/core';

import { GalleryDepsRspackPlugin } from './component-dependencies/bundle/GalleryDepsRspackPlugin';
import {
  getGalleryResolveAlias,
  projectRoot,
} from './component-dependencies/bundle/gallery-resolve';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const galleryRoot = path.join(configDir, 'component-dependencies/gallery');

const config: Configuration = {
  context: projectRoot,
  devServer: {
    allowedHosts: 'all',
    compress: true,
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/playwright\/gallery\/story\/.*/,
          to: '/playwright/gallery/index.html',
        },
      ],
    },
    hot: true,
    port: 3100,
    static: {
      directory: galleryRoot,
      publicPath: '/playwright/gallery',
    },
  },
  devtool: 'source-map',
  entry: {
    gallery: path.join(galleryRoot, 'main.tsx'),
  },
  mode: 'development',
  module: {
    rules: [
      {
        exclude: /\/node_modules\//,
        test: /\.(jsx?|tsx?)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: {
                react: {
                  development: true,
                  runtime: 'automatic',
                },
              },
            },
          },
        },
        type: 'javascript/auto',
      },
      {
        exclude:
          /node_modules\/(?!(@patternfly|@openshift-console\/plugin-shared|@openshift-console\/dynamic-plugin-sdk)\/).*/,
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'resolve-url-loader', options: { sourceMap: true } },
          {
            loader: 'sass-loader',
            options: {
              api: 'modern',
              sassOptions: { style: 'expanded' },
              sourceMap: true,
            },
          },
        ],
        type: 'javascript/auto',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        type: 'javascript/auto',
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff2?|ttf|eot|otf)(\?.*$|$)/,
        type: 'asset/resource',
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  name: 'playwright-gallery',
  output: {
    filename: 'playwright/gallery/[name].js',
    path: path.join(projectRoot, 'dist/gallery'),
    publicPath: '/',
  },
  plugins: [
    new GalleryDepsRspackPlugin(),
    new HtmlRspackPlugin({
      chunks: ['gallery'],
      filename: 'playwright/gallery/index.html',
      template: path.join(galleryRoot, 'index.html'),
    }),
    new ProvidePlugin({
      process: 'process/browser',
    }),
    new DefinePlugin({
      'process.env': JSON.stringify({ NODE_ENV: 'development' }),
      global: 'globalThis',
      'window.SERVER_FLAGS': JSON.stringify({ basePath: '/' }),
    }),
  ],
  resolve: {
    alias: getGalleryResolveAlias(),
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.join(projectRoot, 'node_modules')],
    // Do not use tsconfig paths here — they override @multicluster/* stub aliases.
  },
};

export default config;
