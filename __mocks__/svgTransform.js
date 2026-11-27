const path = require('path');

/**
 * Jest transformer for `*.svg` imports.
 *
 * Webpack turns an `import icon from './x.svg'` into a (hashed) asset URL string.
 * Under Jest, this transformer resolves each SVG to its own file basename (e.g. `fedora.svg`),
 * so tests can assert which icon a component actually rendered.
 */
module.exports = {
  getCacheKey() {
    return 'svgTransform-v1';
  },
  process(_src, filename) {
    return { code: `module.exports = ${JSON.stringify(path.basename(filename))};` };
  },
};
