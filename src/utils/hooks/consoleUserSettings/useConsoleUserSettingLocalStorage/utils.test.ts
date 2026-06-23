import { CONSOLE_NAMESPACE_BOOKMARKS_KEY } from '@kubevirt-utils/hooks/useConsoleNamespaceBookmarks/consts';

import { TEST_FAVORITE_BOOKMARKS } from '../tests/constants';

import { CONSOLE_USER_SETTINGS } from './consts';
import {
  parseBooleanUserPreference,
  parseStoredBooleanUserPreference,
  readConsoleUserSettingsLocalStorage,
  serializeBooleanUserPreference,
  writeConsoleUserSettingsLocalStorage,
} from './utils';

describe('parseBooleanUserPreference', () => {
  it('returns false for missing values', () => {
    expect(parseBooleanUserPreference(undefined)).toBe(false);
  });

  it('parses JSON boolean strings', () => {
    expect(parseBooleanUserPreference('true')).toBe(true);
    expect(parseBooleanUserPreference('false')).toBe(false);
  });
});

describe('parseStoredBooleanUserPreference', () => {
  it('accepts boolean and string values', () => {
    expect(parseStoredBooleanUserPreference(true)).toBe(true);
    expect(parseStoredBooleanUserPreference('true')).toBe(true);
    expect(parseStoredBooleanUserPreference('false')).toBe(false);
  });
});

describe('serializeBooleanUserPreference', () => {
  it('serializes booleans as JSON strings', () => {
    expect(serializeBooleanUserPreference(true)).toBe('true');
    expect(serializeBooleanUserPreference(false)).toBe('false');
  });
});

describe('localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('reads and writes console user settings from localStorage', () => {
    writeConsoleUserSettingsLocalStorage({
      [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: TEST_FAVORITE_BOOKMARKS,
    });

    expect(readConsoleUserSettingsLocalStorage()).toEqual({
      [CONSOLE_NAMESPACE_BOOKMARKS_KEY]: TEST_FAVORITE_BOOKMARKS,
    });
  });

  it('returns empty object for invalid localStorage JSON', () => {
    localStorage.setItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY, '{invalid');
    expect(readConsoleUserSettingsLocalStorage()).toEqual({});
  });
});
