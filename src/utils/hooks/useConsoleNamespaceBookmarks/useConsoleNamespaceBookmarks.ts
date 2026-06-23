import { UseConsoleNamespaceBookmarks } from '@kubevirt-utils/hooks/consoleUserSettings/types';
import useConsoleBookmarks from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleBookmarks/useConsoleBookmarks';

import { CONSOLE_NAMESPACE_BOOKMARKS_KEY } from './consts';

const useConsoleNamespaceBookmarks: UseConsoleNamespaceBookmarks = (cluster) =>
  useConsoleBookmarks(CONSOLE_NAMESPACE_BOOKMARKS_KEY, cluster);

export default useConsoleNamespaceBookmarks;
