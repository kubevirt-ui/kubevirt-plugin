import { TFunction } from 'react-i18next';
import validator from 'validator';

export enum ValidationOption {
  success = 'success',
  error = 'error',
  default = 'default',
}

export type ValidationStatus = { [key: string]: { message: string; type: ValidationOption } };

export const get = (object, keys, defaultVal?) => {
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];
  if (object && keys.length > 1) {
    return get(object, keys.slice(1));
  }
  return object === undefined ? defaultVal : object;
};

/**
 * Set a value inside an object with its path: example: set({}, 'a.b.c', '...') => { a: { b: { c: '...' } } }
 * If one of the keys in path doesn't exists in object, it'll be created.
 *
 * @param object Object to manipulate
 * @param path Path to the object field that need to be created/updated
 * @param value Value to set
 */
export const set = (object, path: string | string[], value) => {
  const decomposedPath = Array.isArray(path) ? path : [path];
  const base = decomposedPath[0];

  if (base === undefined) {
    return object;
  }

  // assign an empty object in order to spread object
  if (!Object.prototype.hasOwnProperty.call(object, base)) {
    object[base] = {};
  }

  // Determine if there is still layers to traverse
  value =
    decomposedPath.length <= 1
      ? value
      : set(object[base], decomposedPath.slice(1).join('.'), value);

  return {
    ...object,
    [base]: value,
  };
};

export const isValidSSHKey = (value: string): boolean => {
  try {
    return /^(ssh-rsa AAAAB3NzaC1yc2|ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNT|ecdsa-sha2-nistp384 AAAAE2VjZHNhLXNoYTItbmlzdHAzODQAAAAIbmlzdHAzOD|ecdsa-sha2-nistp521 AAAAE2VjZHNhLXNoYTItbmlzdHA1MjEAAAAIbmlzdHA1Mj|ssh-ed25519 AAAAC3NzaC1lZDI1NTE5|ssh-dss AAAAB3NzaC1kc3)[0-9A-Za-z+/]+[=]{0,3}( .*)?$/.test(
      value,
    );
  } catch {
    return false;
  }
};

export const checkName = (
  obj: { [key: string]: string | string[] },
  errorCatcher: ErrorCatcher,
  t: TFunction<'plugin__kubevirt-plugin', undefined>,
) => {
  errorCatcher.removeError('name');
  if (obj?.name) {
    const isAsciiName = validator.isAscii(obj?.name);
    if (!isAsciiName) {
      errorCatcher.addError(t('Name can be only numbers and letters'), 'name');
    }
  }
};

export const checkHostname = (
  obj: { [key: string]: string | string[] },
  errorCatcher: ErrorCatcher,
  t: TFunction<'plugin__kubevirt-plugin', undefined>,
) => {
  errorCatcher.removeError('hostname');
  if (obj?.hostname) {
    const isAsciiHostname = validator.isAscii(obj?.hostname);
    if (!isAsciiHostname) {
      errorCatcher.addError(t('Hostname can be only numbers and letters'), 'hostname');
    }
  }
};

export const checkUser = (
  obj: { [key: string]: string | string[] },
  errorCatcher: ErrorCatcher,
  t: TFunction<'plugin__kubevirt-plugin', undefined>,
) => {
  errorCatcher.removeError('user');
  const isValidUsername = /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/.test(obj?.user as string);
  if (!isValidUsername) {
    errorCatcher.addError(t('Username is required. must be a valid OS username'), 'user');
  }
};

export const checkSSHKeys = (
  obj: { [key: string]: string[] },
  errorCatcher: ErrorCatcher,
  t: TFunction<'plugin__kubevirt-plugin', undefined>,
) => {
  if (obj?.ssh_authorized_keys) {
    obj?.ssh_authorized_keys?.map(
      (key: string, index: number) =>
        key && errorCatcher.removeError(['ssh_authorized_keys', index.toString()]),
    );
    const brokenSSHKeys =
      Array.isArray(obj?.ssh_authorized_keys) &&
      obj?.ssh_authorized_keys
        .map((value, index) => (!!value && !isValidSSHKey(value) ? index : null))
        .filter((key) => key !== null);

    if (brokenSSHKeys) {
      brokenSSHKeys.forEach((invalidKeyIndex) =>
        errorCatcher.addError(t('SSH Key is incorrect'), [
          'ssh_authorized_keys',
          invalidKeyIndex.toString(),
        ]),
      );
    }
  }
};

export const checkPassword = (
  obj: { [key: string]: string | string[] },
  errorCatcher: ErrorCatcher,
  t: TFunction<'plugin__kubevirt-plugin', undefined>,
) => {
  errorCatcher.removeError('password');
  const isAsciiPassword = obj?.password && validator.isAscii(obj?.password);
  const hasWhiteSpaces = obj?.password && /\s/g.test(obj?.password as string);
  if ((hasWhiteSpaces || !isAsciiPassword) && !!obj?.password) {
    errorCatcher.addError(t('Password can be only numbers and letters'), 'password');
  }
};

export const prefixedID = (idPrefix: string, id: string) =>
  idPrefix && id ? `${idPrefix}-${id}` : null;

export const joinIDs = (...ids: string[]) => ids.join('-');

export const cloudinitIDGenerator = (id: string) => prefixedID('cloudint', id);

export class ErrorCatcher {
  errors: ValidationStatus = {};

  get isValid() {
    return !Object.values(this.errors)
      .reduce((acc, value) => {
        const recursiveFunction = (recursiveValue) => {
          if (recursiveValue?.type) {
            acc.push(recursiveValue);
            return;
          }
          if (Array.isArray(recursiveValue)) {
            recursiveValue.forEach((val) => recursiveFunction(val));
            return;
          }
          recursiveFunction(Object.values(recursiveValue));
        };
        value?.type ? acc.push(value) : recursiveFunction(value);
        return acc;
      }, [])
      .some((error) => error?.type === ValidationOption.error);
  }

  addError = (message: string, field: string | string[]) => {
    this.changeError(field, { message, type: ValidationOption.error });
  };

  removeError = (field: string | string[]) => {
    this.changeError(field, { message: '', type: ValidationOption.success });
  };

  changeError = (field: string | string[], value: { message: string; type: ValidationOption }) => {
    this.errors = set(this.errors, field, value);
  };

  getErrorMessage = (field: string) => this.errors?.[field]?.message;

  getErrorType = (field: string) => this.errors?.[field]?.type;

  getErrors = () => this.errors;
}
