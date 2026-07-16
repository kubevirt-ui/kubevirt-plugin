import { useState } from 'react';

type UseMetadataTabStateReturn = {
  isAdvancedView: boolean;
  setIsAdvancedView: (value: boolean) => void;
};

const useMetadataTabState = (): UseMetadataTabStateReturn => {
  const [isAdvancedView, setIsAdvancedView] = useState(false);

  return {
    isAdvancedView,
    setIsAdvancedView,
  };
};

export default useMetadataTabState;
