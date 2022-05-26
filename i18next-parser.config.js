// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CustomJSONLexer } = require('./i18n-scripts/lexers');

module.exports = {
  input: ['src/**/*.{js,jsx,ts,tsx}'],
  sort: true,
  createOldCatalogs: false,
  keySeparator: false,
  locales: ['en'],
  namespaceSeparator: '~',
  reactNamespace: false,
  defaultNamespace: 'plugin__kubevirt-plugin',
  useKeysAsDefaultValue: true,

  // see below for more details
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],
    json: [CustomJSONLexer],

    default: ['JavascriptLexer'],
  },
};
