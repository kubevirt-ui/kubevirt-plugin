import { YAML_PATH_SUFFIX } from './constants';
import { EditorType } from './types';

export const getEditorTypeFromPath = (pathname: string): EditorType => {
  if (pathname.endsWith(YAML_PATH_SUFFIX)) {
    return EditorType.YAML;
  }
  return EditorType.Form;
};
