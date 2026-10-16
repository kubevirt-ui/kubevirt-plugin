import { useState } from 'react';

import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';

/**
 * Captures the initial value of `currentState` on first render and returns `true`
 * when the current value is deeply equal to that snapshot.
 * Works with any serialisable state shape (object, array, primitive).
 */
export const useNoChangesMade = <T>(currentState: T): boolean => {
  const [initialState] = useState(currentState);
  return isEqualObject(currentState, initialState);
};
