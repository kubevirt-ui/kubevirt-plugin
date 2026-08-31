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

const handleArrowRight = (
  focusedItemIndex: number,
  isLeftCol: boolean,
  keyCount: number,
  midpoint: number,
): null | number => {
  if (!isLeftCol) return null;
  const target = focusedItemIndex + midpoint;
  return target < keyCount ? target : null;
};

const handleArrowLeft = (
  focusedItemIndex: number,
  isRightCol: boolean,
  midpoint: number,
): null | number => {
  if (!isRightCol) return null;
  return focusedItemIndex - midpoint;
};

const handleArrowDown = (
  focusedItemIndex: number,
  isLeftCol: boolean,
  isRightCol: boolean,
  keyCount: number,
  midpoint: number,
  totalCount: number,
): null | number => {
  if (focusedItemIndex < 0) return 0;

  if (isLeftCol) {
    const nextRow = focusedItemIndex + 1;
    return nextRow < midpoint ? nextRow : midpoint;
  }

  if (isRightCol) {
    const nextIndex = focusedItemIndex + 1;
    if (nextIndex < keyCount) return nextIndex;
    return keyCount < totalCount ? keyCount : 0;
  }

  return (focusedItemIndex + 1) % totalCount;
};

const handleArrowUp = (focusedItemIndex: number, totalCount: number): null | number => {
  if (focusedItemIndex <= 0) return totalCount - 1;
  return focusedItemIndex - 1;
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
): null | number => {
  if (totalCount === 0) return null;

  const isInKeys = focusedItemIndex >= 0 && focusedItemIndex < keyCount;
  const isLeftCol = isInKeys && focusedItemIndex < midpoint;
  const isRightCol = isInKeys && focusedItemIndex >= midpoint;

  switch (eventKey) {
    case KeyTypes.ArrowRight:
      return handleArrowRight(focusedItemIndex, isLeftCol, keyCount, midpoint);
    case KeyTypes.ArrowLeft:
      return handleArrowLeft(focusedItemIndex, isRightCol, midpoint);
    case KeyTypes.ArrowDown:
      return handleArrowDown(
        focusedItemIndex,
        isLeftCol,
        isRightCol,
        keyCount,
        midpoint,
        totalCount,
      );
    case KeyTypes.ArrowUp:
      return handleArrowUp(focusedItemIndex, totalCount);
    default:
      return null;
  }
};
