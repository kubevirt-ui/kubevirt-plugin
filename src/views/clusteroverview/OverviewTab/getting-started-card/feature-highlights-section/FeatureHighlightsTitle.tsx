import * as React from 'react';

type FeatureHighlightsTitleProps = {
  readTime: string;
  title: string;
};

const FeatureHighlightsTitle: React.FC<FeatureHighlightsTitleProps> = ({
  readTime,
  title,
}): React.ReactElement => (
  <span>
    {title} &#8226;{' '}
    <span className="kv-feature-highlights-card--time-estimate">{`${readTime} read`}</span>
  </span>
);

export default FeatureHighlightsTitle;
