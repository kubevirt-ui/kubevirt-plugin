import * as React from 'react';

type FeatureHighlightsTitleProps = {
  title: string;
  readTime: string;
};

const FeatureHighlightsTitle: React.FC<FeatureHighlightsTitleProps> = ({
  title,
  readTime,
}): React.ReactElement => (
  <span>
    {title} &#8226;{' '}
    <span className="kv-feature-highlights-card--time-estimate">{`${readTime} read`}</span>
  </span>
);

export default FeatureHighlightsTitle;
