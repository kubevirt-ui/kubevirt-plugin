import React, { FC } from 'react';

type SuggestionLineProps = {
  className?: string;
  onClick: (param: string) => void;
  suggestion: string;
};

const SuggestionLine: FC<SuggestionLineProps> = ({ className, onClick, suggestion }) => {
  return (
    <button className="co-suggestion-line" onClick={() => onClick(suggestion)}>
      <span className={className}>{suggestion}</span>
    </button>
  );
};

export default SuggestionLine;
