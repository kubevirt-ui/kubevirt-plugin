// eslint-disable-next-line @typescript-eslint/no-var-requires
const { CustomJSONLexer } = require('./i18n-scripts/lexers');

module.exports = {
  createOldCatalogs: false,
  defaultNamespace: 'plugin__kubevirt-plugin',
  defaultValue: (lng, ns, key) => {
    return key;
  },
  input: ['src/**/*.{js,jsx,ts,tsx,json}'],
  keySeparator: false,
  // see below for more details
  lexers: {
    default: ['JavascriptLexer'],
    handlebars: ['HandlebarsLexer'],

    hbs: ['HandlebarsLexer'],
    htm: ['HTMLLexer'],

    html: ['HTMLLexer'],
    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    json: [CustomJSONLexer],
    jsx: ['JsxLexer'],
    mjs: ['JavascriptLexer'],
    ts: ['JavascriptLexer'],

    tsx: [
      {
        lexer: 'JsxLexer',
        transKeepBasicHtmlNodesFor: ['br'],
        transSupportBasicHtmlNodes: true,
      },
    ],
  },
  locales: ['en', 'es', 'fr', 'ja', 'ko', 'zh'],
  namespaceSeparator: '~',
  reactNamespace: false,
  sort: true,
  useKeysAsDefaultValue: true,
};
