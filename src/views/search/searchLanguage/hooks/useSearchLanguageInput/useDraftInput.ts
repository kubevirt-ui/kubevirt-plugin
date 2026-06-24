import { useCallback, useState } from 'react';

type UseDraftInput = (committedText: string) => {
  displayText: string;
  exitDraft: () => void;
  isDraft: boolean;
  setDraftText: (value: string) => void;
};

const useDraftInput: UseDraftInput = (committedText) => {
  const [draftTextInner, setDraftTextInner] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  const displayText = isDraft ? draftTextInner : committedText;

  const exitDraft = useCallback(() => {
    setIsDraft(false);
    setDraftTextInner('');
  }, []);

  const setDraftText = useCallback((value: string) => {
    setIsDraft(true);
    setDraftTextInner(value);
  }, []);

  return {
    displayText,
    exitDraft,
    isDraft,
    setDraftText,
  };
};

export default useDraftInput;
