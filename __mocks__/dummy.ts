// This dummy file is used to resolve @Console imports from @openshift-console for JEST
// You can add any exports needed by your tests here
// Check "moduleNameMapper" in package.json

export class Dummy extends Error {
  constructor() {
    super('Dummy file for exports');
  }
}

export function useResolvedExtensions(): any[] {
  return [undefined, undefined, undefined];
}
