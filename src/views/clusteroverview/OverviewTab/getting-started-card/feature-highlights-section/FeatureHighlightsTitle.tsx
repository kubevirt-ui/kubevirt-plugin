import React, { FC } from 'react';

type FeatureHighlightsTitleProps = {
  readTime: string;
  title: string;
};

const FeatureHighlightsTitle: FC<FeatureHighlightsTitleProps> = ({ readTime, title }) => (
  <span>
    {title} &#8226;{' '}
    <span className="kv-feature-highlights-card--time-estimate">{`${readTime} read`}</span>
  </span>
);

export default FeatureHighlightsTitle;
