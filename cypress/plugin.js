/* eslint-disable @typescript-eslint/no-var-requires */
// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const fs = require('fs');
const path = require('path');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');

module.exports = (on, config) => {
  on(
    'file:preprocessor',
    createBundler({
      sourcemap: true,
      sourcesContent: true,
    }),
  );

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

  return config;
};
