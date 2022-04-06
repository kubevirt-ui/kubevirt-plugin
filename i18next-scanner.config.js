/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const typescript = require('typescript');

module.exports = {
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  output: './',
  options: {
    lngs: ['en'],
    ns: ['plugin__kubevirt-plugin'],
    defaultLng: 'en',
    defaultNs: 'plugin__kubevirt-plugin',
    resource: {
      loadPath: 'locales/{{lng}}/{{ns}}.json',
      savePath: 'locales/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },
    nsSeparator: '~',
    keySeparator: false,
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
    func: {
      list: ['i18next.t', 'i18n.t', 't'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: {
      component: 'Trans',
      extensions: [],
      fallbackKey: function (ns, value) {
        return value;
      },
    },
    defaultValue: function (lng, ns, key) {
      return key;
    },
  },
  transform: function (file, enc, done) {
    const { base, ext } = path.parse(file.path);
    if (['.ts', '.tsx'].includes(ext) && !base.includes('.d.ts')) {
      const content = fs.readFileSync(file.path, enc);

      const { outputText } = typescript.transpileModule(content, {
        reportDiagnostics: false,
        compilerOptions: {
          target: 'es2016',
          jsx: 'preserve',
        },
        fileName: path.basename(file.path),
      });

      this.parser.parseTransFromString(outputText);
    }

    done();
  },
};
