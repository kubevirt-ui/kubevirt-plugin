import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';

import { YAML_PATH_SUFFIX } from '../utils/constants';
import { EditorType } from '../utils/types';
import { getEditorTypeFromPath } from '../utils/utils';

type UseEditorType = () => [EditorType, (type: EditorType) => void];

export const useEditorType: UseEditorType = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  const editorType = getEditorTypeFromPath(pathname);

  const setEditorType = useCallback(
    (type: EditorType) => {
      const basePath = pathname.endsWith(YAML_PATH_SUFFIX)
        ? pathname.slice(0, -YAML_PATH_SUFFIX.length)
        : pathname;

      const newPath = type === EditorType.YAML ? `${basePath}${YAML_PATH_SUFFIX}` : basePath;

      if (newPath !== pathname) {
        navigate({ pathname: newPath, search }, { replace: true });
      }
    },
    [pathname, search, navigate],
  );

  return [editorType, setEditorType];
};
