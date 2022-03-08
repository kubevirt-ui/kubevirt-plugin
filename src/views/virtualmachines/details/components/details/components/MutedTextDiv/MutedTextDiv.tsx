import * as React from 'react';

type MutedTextDivProps = {
  text: string;
};

// If translation is needed, sent text as a prop which is already translated
const MutedTextDiv: React.FC<MutedTextDivProps> = ({ text }) => {
  return <div className="text-muted">{text}</div>;
};

export default MutedTextDiv;
