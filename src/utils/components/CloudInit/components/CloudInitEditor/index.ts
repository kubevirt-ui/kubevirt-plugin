import React from 'react';

const CloudInitEditor = React.lazy(() =>
  import('./CloudInitEditor').then((module) => ({ default: module._CloudInitEditor })),
);

export default CloudInitEditor;
