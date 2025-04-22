import * as React from 'react';

type MutedTextSpanProps = {
  text: string;
};

// If translation is needed, sent text as a prop which is already translated
const MutedTextSpan: React.FC<MutedTextSpanProps> = ({ text }) => {
  return <span className="pf-v6-u-text-color-subtle">{text}</span>;
};

export default MutedTextSpan;
