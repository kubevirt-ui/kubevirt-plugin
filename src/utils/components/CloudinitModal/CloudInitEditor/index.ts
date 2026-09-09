import { lazy } from 'react';

const CloudInitEditor = lazy(() =>
  import('./CloudInitEditor').then((module) => ({ default: module.CloudInitEditor })),
);

export default CloudInitEditor;
