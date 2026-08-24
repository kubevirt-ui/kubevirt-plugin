import { useEffect, useRef, useState } from 'react';

import { type CodeEditorRef } from '@openshift-console/dynamic-plugin-sdk';

import { createSelection, getLinesToHighlight } from './utils';

type EditorInstance = {
  getAction: (id: string) => { run: () => Promise<void> };
  revealLineInCenter: (lineNumber: number) => void;
  setSelections: (selections: unknown[]) => void;
};

export const useEditorHighlighter = (
  editableYAML: string,
  pathsToHighlight: string[],
  showEditor: boolean,
): ((ref: CodeEditorRef) => void) => {
  const [editor, setEditor] = useState<EditorInstance>();
  const isHighlighedRef = useRef(false);

  useEffect(() => {
    isHighlighedRef.current = false;
  }, [pathsToHighlight, showEditor]);

  useEffect(() => {
    if (!showEditor) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const highlightPaths = async (): Promise<void> => {
      if (editor && editableYAML && pathsToHighlight && !isHighlighedRef.current) {
        const ranges = getLinesToHighlight(editableYAML, pathsToHighlight);

        if (ranges.length === 0) {
          return;
        }

        isHighlighedRef.current = true;

        await editor.getAction('editor.foldAll').run();
        if (cancelled) return;

        const selections = ranges.map((range) => createSelection(range));

        editor.setSelections(selections);
        await editor.getAction('editor.unfoldRecursively').run();
        if (cancelled) return;

        timeoutId = setTimeout(() => editor.revealLineInCenter(ranges.at(-1).start), 500);
      }
    };

    void highlightPaths();

    return (): void => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [editableYAML, editor, pathsToHighlight, showEditor]);

  return (ref: CodeEditorRef): void => setEditor(ref?.editor as EditorInstance);
};
