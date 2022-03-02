import * as React from 'react';

const Loading: React.FC = () => (
  <div className="co-m-loader co-an-fade-in-out" data-test="loading-indicator">
    <div className="co-m-loader-dot__one" />
    <div className="co-m-loader-dot__two" />
    <div className="co-m-loader-dot__three" />
  </div>
);

export default React.memo(Loading);
