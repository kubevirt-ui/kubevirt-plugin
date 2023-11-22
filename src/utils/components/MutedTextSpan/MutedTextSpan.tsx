import * as React from 'react';

type MutedTextSpanProps = {
  text: string;
};

// If translation is needed, sent text as a prop which is already translated
const MutedTextSpan: React.FC<MutedTextSpanProps> = ({ text }) => {
  return <span className="text-muted">{text}</span>;
};

export default MutedTextSpan;
