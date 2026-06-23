import { UseConsoleClusterBookmarks } from '@kubevirt-utils/hooks/consoleUserSettings/types';
import useConsoleBookmarks from '@kubevirt-utils/hooks/consoleUserSettings/useConsoleBookmarks/useConsoleBookmarks';

import { CONSOLE_CLUSTER_BOOKMARKS_KEY } from './consts';

const useConsoleClusterBookmarks: UseConsoleClusterBookmarks = (cluster) =>
  useConsoleBookmarks(CONSOLE_CLUSTER_BOOKMARKS_KEY, cluster);

export default useConsoleClusterBookmarks;
