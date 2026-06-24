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
