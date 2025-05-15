const fs = require('fs');
const path = require('path');

const messages = require( '../locales/en/plugin__kubevirt-plugin.json');

const TARGETS_FOR_DUMMY_LOCALE = ['es','fr'];
const wrappers = {
  es:(message) => `\u21d2 ${message} \u21d0`,
  fr: (message) => `@ ${message} @`
}

function insertDummyLocaleAndSave(messages, destination, wrap) {
  const dummyMessages = {};
  Object.keys(messages).forEach((key) => {
    const message = messages[key] ?? key;
    dummyMessages[key] = wrap(message);
  });

  const serializedContent = JSON.stringify(dummyMessages, null, "  ") + '\n';
  const dirname = path.dirname(destination)
  if( !fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
  fs.writeFileSync(destination, serializedContent);
}

TARGETS_FOR_DUMMY_LOCALE.forEach(target => {
  const destination = path.join('locales', target, 'plugin__kubevirt-plugin.json');
  insertDummyLocaleAndSave(
    messages, 
    destination, 
    wrappers[target]);
  console.log(   
      `[i18n-scripts] dummy locale for ${target} inserted to ${destination} ✔`,
  );
})


