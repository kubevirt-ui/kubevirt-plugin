const fs = require('fs');
const path = require('path');
const pluralize = require('pluralize');
const common = require('./common.js');

const publicDir = path.join(__dirname, './../locales/');


/**
 * {{count}} item_other  --> 0
 * {{count}} item_one    --> 1
 * item_other            --> 2
 * item_one              --> 3
 */
function determineRule(key) {
  const withCount = key.startsWith('{{count}}')


  if (withCount && key.includes('_other')) {
    return 0;
  }
  if (withCount) {
    return 1;
  }
  if (key.includes('_other')) {
    return 2;
  }
  if (key.includes('_one')) {
    return 3;
  }
  return 4;
}

function updateFile(fileName) {
  const file = require(fileName);
  const updatedFile = {};

  const keys = Object.keys(file);

  let originalKey;

  for (let i = 0; i < keys.length; i++) {
      // translations
      // "{{count}} item_other": "{{count}} items",
      // "{{count}} item_one": "item",
      // "item_other": "item",
      // "item_one": "item"
      switch (determineRule(keys[i])) {
        case 0:
          [originalKey] = keys[i].split('_other');
          updatedFile[keys[i]] = `{{count}} ${pluralize(originalKey)}`;
          break;
        case 1:
          [originalKey] = keys[i].split('_one');
          updatedFile[keys[i]] = `{{count}} ${originalKey}`;
          break;
        case 2:
          [originalKey] = keys[i].split('_other');
          updatedFile[keys[i]] = originalKey;
          break;
        case 3:
          [originalKey] = keys[i].split('_one');
          updatedFile[keys[i]] = originalKey;
          break;
        default:
          updatedFile[keys[i]] = keys[i];
      }
  }

  fs.promises
    .writeFile(fileName, JSON.stringify(updatedFile, null, 2))
    .catch((e) => console.error(fileName, e));
}

function processLocalesFolder(filePath) {
  if (path.basename(filePath) === 'en') {
    common.parseFolder(filePath, updateFile);
  }
}

common.parseFolder(publicDir, processLocalesFolder);
