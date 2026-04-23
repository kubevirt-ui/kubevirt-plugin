import React, { FC } from 'react';

type MutedTextSpanProps = {
  text: string;
};

// If translation is needed, sent text as a prop which is already translated
const MutedTextSpan: FC<MutedTextSpanProps> = ({ text }) => {
  return <span className="pf-v6-u-text-color-subtle">{text}</span>;
};

export default MutedTextSpan;
