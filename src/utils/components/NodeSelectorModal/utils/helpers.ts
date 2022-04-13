import { IDLabel } from './types';

// export const has = (object, key) => {
//   const keyParts = key.split('.');

//   return (
//     !!object &&
//     (keyParts.length > 1
//       ? has(object[key.split('.')[0]], keyParts.slice(1).join('.'))
//       : object.hasOwnProperty(key))
//   );
// };

export const nodeSelectorToIDLabels = (nodeSelector: { [key: string]: string }): IDLabel[] =>
  Object.entries(nodeSelector || {}).map(([key, value], id) => ({ id, key, value }));

export const isEqualObject = (object, otherObject) => {
  if (object === otherObject) {
    return true;
  }

  if (object === null || otherObject === null) {
    return false;
  }

  if (object.constructor !== otherObject.constructor) {
    return false;
  }

  if (typeof object !== 'object') {
    return false;
  }

  const objectKeys = Object.keys(object);
  const otherObjectKeys = Object.keys(otherObject);

  if (objectKeys.length !== otherObjectKeys.length) {
    return false;
  }

  for (const key of objectKeys) {
    if (!otherObjectKeys.includes(key) || !isEqualObject(object[key], otherObject[key])) {
      return false;
    }
  }

  return true;
};
