import { ConsoleBookmarks } from '../types';

export const parseBookmarks = (bookmarksData: string | undefined): ConsoleBookmarks => {
  if (!bookmarksData) {
    return {};
  }

  try {
    return (JSON.parse(bookmarksData) as ConsoleBookmarks) || {};
  } catch {
    return {};
  }
};

export const parseStoredBookmarks = (value: unknown): ConsoleBookmarks => {
  if (!value) {
    return {};
  }

  if (typeof value === 'string') {
    return parseBookmarks(value);
  }

  if (typeof value === 'object') {
    return (value as ConsoleBookmarks) || {};
  }

  return {};
};

export const areBookmarksEqual = (a: ConsoleBookmarks, b: ConsoleBookmarks): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every((key) => a[key] === b[key]);
};
