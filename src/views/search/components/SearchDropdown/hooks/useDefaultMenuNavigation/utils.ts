import { KeyTypes } from '@patternfly/react-core';

type SectionFocusIndices = {
  examplesFocusedIndex: number;
  keysFocusedIndex: number;
  recentFocusedIndex: number;
};

const NO_FOCUS: SectionFocusIndices = {
  examplesFocusedIndex: -1,
  keysFocusedIndex: -1,
  recentFocusedIndex: -1,
};

export const getSectionFocusIndices = (
  focusedItemIndex: number,
  keyCount: number,
  recentCount: number,
): SectionFocusIndices => {
  if (focusedItemIndex < 0) return NO_FOCUS;

  if (focusedItemIndex < keyCount) return { ...NO_FOCUS, keysFocusedIndex: focusedItemIndex };

  if (focusedItemIndex < keyCount + recentCount)
    return { ...NO_FOCUS, recentFocusedIndex: focusedItemIndex - keyCount };

  return { ...NO_FOCUS, examplesFocusedIndex: focusedItemIndex - keyCount - recentCount };
};

/**
 * 2D grid navigation for the two-column keys section + linear post-keys sections.
 * Returns the next focusedItemIndex, or null if the eventKey should not be handled.
 *
 * Flat index layout: [leftCol(0..mid-1), rightCol(mid..keyCount-1), recentSearches, examples]
 */
export const getNextGridIndex = (
  eventKey: string,
  focusedItemIndex: number,
  midpoint: number,
  keyCount: number,
  totalCount: number,
): number | null => {
  if (totalCount === 0) return null;

  const isInKeys = focusedItemIndex >= 0 && focusedItemIndex < keyCount;
  const isLeftCol = isInKeys && focusedItemIndex < midpoint;
  const isRightCol = isInKeys && focusedItemIndex >= midpoint;

  switch (eventKey) {
    case KeyTypes.ArrowRight: {
      if (!isLeftCol) return null;
      const target = focusedItemIndex + midpoint;
      return target < keyCount ? target : null;
    }

    case KeyTypes.ArrowLeft: {
      if (!isRightCol) return null;
      return focusedItemIndex - midpoint;
    }

    case KeyTypes.ArrowDown: {
      if (focusedItemIndex < 0) return 0;

      if (isLeftCol) {
        const nextRow = focusedItemIndex + 1;
        if (nextRow < midpoint) return nextRow;
        return midpoint;
      }
      if (isRightCol) {
        const nextIndex = focusedItemIndex + 1;
        if (nextIndex < keyCount) return nextIndex;
        return keyCount < totalCount ? keyCount : 0;
      }
      // post-keys: linear
      return (focusedItemIndex + 1) % totalCount;
    }

    case KeyTypes.ArrowUp: {
      if (focusedItemIndex <= 0) return totalCount - 1;
      return focusedItemIndex - 1;
    }

    default:
      return null;
  }
};
