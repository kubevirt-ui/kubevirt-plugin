/** Declarative UI checks for gallery scene tests. */

export type StoryStateExpectation =
  | { type: 'containsText'; text: string }
  | { type: 'dialogVisible' }
  | { type: 'visibleTestId'; id: string };
