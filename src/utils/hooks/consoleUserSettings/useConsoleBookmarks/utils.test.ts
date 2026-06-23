import { TEST_FAVORITE_BOOKMARKS } from '../tests/constants';

import { areBookmarksEqual, parseBookmarks, parseStoredBookmarks } from './utils';

describe('parseBookmarks', () => {
  it('returns empty object for missing or invalid data', () => {
    expect(parseBookmarks(undefined)).toEqual({});
    expect(parseBookmarks('not-json')).toEqual({});
  });

  it('parses bookmark JSON from ConfigMap data', () => {
    expect(parseBookmarks(JSON.stringify(TEST_FAVORITE_BOOKMARKS))).toEqual(
      TEST_FAVORITE_BOOKMARKS,
    );
  });
});

describe('parseStoredBookmarks', () => {
  it('parses object values from localStorage', () => {
    expect(parseStoredBookmarks(TEST_FAVORITE_BOOKMARKS)).toEqual(TEST_FAVORITE_BOOKMARKS);
  });

  it('parses string values from ConfigMap-style storage', () => {
    expect(parseStoredBookmarks(JSON.stringify(TEST_FAVORITE_BOOKMARKS))).toEqual(
      TEST_FAVORITE_BOOKMARKS,
    );
  });
});

describe('areBookmarksEqual', () => {
  it('compares bookmark keys and values', () => {
    expect(areBookmarksEqual({ a: true }, { a: true })).toBe(true);
    expect(areBookmarksEqual({ a: true }, { b: true })).toBe(false);
    expect(areBookmarksEqual({ a: true, b: true }, { a: true })).toBe(false);
  });
});
