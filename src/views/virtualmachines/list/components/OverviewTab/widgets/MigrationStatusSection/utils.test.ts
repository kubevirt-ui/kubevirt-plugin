import { getNamespacePathSegment } from '@kubevirt-utils/utils/utils';

import {
  getMigrationsTabPath,
  LEGACY_MIGRATIONS_PAGE_PATH,
  STANDALONE_MIGRATIONS_PAGE_PATH,
} from './utils';

const allNamespacesMigrationsTabPath = (pagePath: string) =>
  `/k8s/${getNamespacePathSegment('')}/${pagePath}`;

describe('getMigrationsTabPath', () => {
  it('uses standalone migrations page on OpenShift 4.22+', () => {
    expect(getMigrationsTabPath(false, '', '', '4.22.0', true)).toBe(
      allNamespacesMigrationsTabPath(STANDALONE_MIGRATIONS_PAGE_PATH),
    );
  });

  it('uses legacy overview migrations page below OpenShift 4.22', () => {
    expect(getMigrationsTabPath(false, '', '', '4.21.5', true)).toBe(
      allNamespacesMigrationsTabPath(LEGACY_MIGRATIONS_PAGE_PATH),
    );
  });

  it('uses standalone migrations page on future major versions (e.g. 5.x)', () => {
    const standalonePath = allNamespacesMigrationsTabPath(STANDALONE_MIGRATIONS_PAGE_PATH);
    expect(getMigrationsTabPath(false, '', '', '5.1.0', true)).toBe(standalonePath);
    expect(getMigrationsTabPath(false, '', '', '5.01.0', true)).toBe(standalonePath);
  });

  it('returns undefined while cluster version is loading', () => {
    expect(getMigrationsTabPath(false, '', '', undefined, false)).toBeUndefined();
    expect(getMigrationsTabPath(false, '', '', '4.22.0', false)).toBeUndefined();
  });

  it('defaults to standalone when loaded but version is missing (fetch error)', () => {
    expect(getMigrationsTabPath(false, '', '', undefined, true)).toBe(
      allNamespacesMigrationsTabPath(STANDALONE_MIGRATIONS_PAGE_PATH),
    );
  });

  it('falls back to legacy when loaded but version is unparseable', () => {
    expect(getMigrationsTabPath(false, '', '', 'not-a-version', true)).toBe(
      allNamespacesMigrationsTabPath(LEGACY_MIGRATIONS_PAGE_PATH),
    );
  });
});
