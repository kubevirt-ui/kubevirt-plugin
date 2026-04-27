import { lazy } from 'react';

const CloudInitEditor = lazy(() =>
  import('./CloudInitEditor').then((module) => ({ default: module._CloudInitEditor })),
);

export default CloudInitEditor;
