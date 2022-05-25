const fs = require('fs');
const path = require('path');
const { i18nextToPo } = require('i18next-conv');
const minimist = require('minimist');
const common = require('./common.js');

function save(target) {
  return (result) => {
    fs.writeFileSync(target, result);
  };
}

function removeValues(i18nFile, filePath) {
  const file = require(i18nFile);

  const updatedFile = {};

  const keys = Object.keys(file);

  for (let i = 0; i < keys.length; i++) {
    updatedFile[keys[i]] = '';
  }

  const tmpFile = fs.openSync(filePath, 'w');

  fs.writeFileSync(tmpFile, JSON.stringify(updatedFile, null, 2));
}

function consolidateWithExistingTranslations(filePath, fileName, language) {
  const englishFile = require(filePath);
  const englishKeys = Object.keys(englishFile);
  const existingTranslationsPath = `./../locales/${language}/${fileName}.json`;
  if (fs.existsSync(path.join(__dirname, existingTranslationsPath))) {
    const existingTranslationsFile = require(path.join(__dirname, existingTranslationsPath));
    const existingKeys = Object.keys(existingTranslationsFile);
    const matchingKeys = englishKeys.filter((k) => existingKeys.indexOf(k) > -1);

    for (let i = 0; i < matchingKeys.length; i++) {
      englishFile[matchingKeys[i]] = existingTranslationsFile[matchingKeys[i]];
    }

    fs.writeFileSync(filePath, JSON.stringify(englishFile, null, 2));
  }
}

function processFile(fileName, language) {
  let tmpFile;

  const i18nFile = path.join(__dirname, `./../locales/en/${fileName}.json`);

  try {
    if (fs.existsSync(i18nFile)) {
      fs.mkdirSync(path.join(__dirname, './../locales/tmp'), { recursive: true });

      tmpFile = path.join(__dirname, `./../locales/tmp/${fileName}.json`);

      removeValues(i18nFile, tmpFile);
      consolidateWithExistingTranslations(tmpFile, fileName, language);

      fs.mkdirSync(path.join(__dirname, `./../po-files/${language}`), { recursive: true });
      i18nextToPo(language, fs.readFileSync(tmpFile), {
        language,
        foldLength: 0,
        ctxSeparator: '~',
      })
        .then(
          save(
            path.join(
              __dirname,
              `./../po-files/${language}/${path.basename(fileName)}.po`,
            ),
            language,
          ),
        )
        .catch((e) => console.error(fileName, e));
    }
  } catch (err) {
    console.error(`Failed to processFile ${fileName}:`, err);
  }

  common.deleteFile(tmpFile);
  console.log(`Processed ${fileName}`);
}

const options = {
  string: ['language', 'file'],
  boolean: ['help'],
  array: ['files'],
  alias: {
    h: 'help',
    f: 'files',
    l: 'language',
  },
  default: {
    files: [],
  },
};

const args = minimist(process.argv.slice(2), options);

if (args.help) {
  console.log(
    "-h: help\n-l: language (i.e. 'ja')\n-f: file name to convert (i.e. 'plugin__kubevirt-plugin')",
  );
} else if (args.files && args.language) {
  if (Array.isArray(args.files)) {
    for (let i = 0; i < args.files.length; i++) {
      processFile(args.files[i], args.language);
    }
  } else {
    processFile(args.files, args.language);
  }
}
