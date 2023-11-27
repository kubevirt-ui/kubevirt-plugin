/* eslint-disable @typescript-eslint/no-var-requires */
// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const fs = require('fs');
const path = require('path');
const wp = require('@cypress/webpack-preprocessor');

module.exports = (on, config) => {
  const options = {
    webpackOptions: {
      module: {
        rules: [
          {
            exclude: /node_modules/,
            test: /\.ts$/,
            use: 'ts-loader',
          },
        ],
      },
      output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'cypress-dist'),
      },
      resolve: {
        extensions: ['.ts', '.js'],
      },
    },
  };
  // `on` is used to hook into various events Cypress emits
  on('task', {
    log(message) {
      // eslint-disable-next-line no-console
      console.log(message);
      return null;
    },
    logError(message) {
      // eslint-disable-next-line no-console
      console.error(message);
      return null;
    },
    logTable(data) {
      // eslint-disable-next-line no-console
      console.table(data);
      return null;
    },
    readFileIfExists(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8');
      }
      return null;
    },
  });
  on('after:screenshot', (details) => {
    // Prepend "1_", "2_", etc. to screenshot filenames because they are sorted alphanumerically in CI's artifacts dir
    const pathObj = path.parse(details.path);
    fs.readdir(pathObj.dir, (_, files) => {
      const newPath = `${pathObj.dir}${path.sep}${files.length}_${pathObj.base}`;
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line consistent-return
        fs.rename(details.path, newPath, (err) => {
          if (err) return reject(err);
          // because we renamed and moved the image, resolve with the new path
          // so it is accurate in the test results
          resolve({ path: newPath });
        });
      });
    });
  });
  on('file:preprocessor', wp(options));
  // `config` is the resolved Cypress config
  config.baseUrl = `${process.env.BRIDGE_BASE_ADDRESS || 'http://localhost:9000'}${(
    process.env.BRIDGE_BASE_PATH || '/'
  ).replace(/\/$/, '')}`;
  config.env.BRIDGE_HTPASSWD_IDP = process.env.BRIDGE_HTPASSWD_IDP;
  config.env.BRIDGE_HTPASSWD_USERNAME = process.env.BRIDGE_HTPASSWD_USERNAME;
  config.env.BRIDGE_HTPASSWD_PASSWORD = process.env.BRIDGE_HTPASSWD_PASSWORD;
  config.env.BRIDGE_KUBEADMIN_PASSWORD = process.env.BRIDGE_KUBEADMIN_PASSWORD;
  return config;
};
