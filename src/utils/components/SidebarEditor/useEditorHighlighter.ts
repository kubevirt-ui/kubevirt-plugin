import { useEffect, useRef, useState } from 'react';

import { YAMLEditorRef } from '@openshift-console/dynamic-plugin-sdk';

import { createSelection, getLinesToHighlight } from './utils';

export const useEditorHighlighter = (
  editableYAML: string,
  pathsToHighlight: string[],
  showEditor: boolean,
) => {
  const [editor, setEditor] = useState<YAMLEditorRef['editor']>();
  const isHighlighed = useRef(false);

  useEffect(() => {
    isHighlighed.current = false;
  }, [pathsToHighlight, showEditor]);

  useEffect(() => {
    const highlightPaths = async () => {
      if (editor && editableYAML && pathsToHighlight && !isHighlighed.current) {
        isHighlighed.current = true;
        const ranges = getLinesToHighlight(editableYAML, pathsToHighlight);

        await editor.getAction('editor.foldAll').run();

        const selections = ranges.map((range) => createSelection(range));

        editor.setSelections(selections);
        await editor.getAction('editor.unfoldRecursively').run();
        setTimeout(() => editor.revealLineInCenter(ranges.at(-1).start), 500);
      }
    };

    highlightPaths();
  }, [editableYAML, editor, pathsToHighlight]);

  return (ref: YAMLEditorRef) => setEditor(ref?.editor);
};
