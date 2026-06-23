import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';

export type ConsoleBookmarks = Record<string, boolean>;

export type ConsoleUserSettingHookResult<T, U extends (value: T) => Promise<T>> = [
  T,
  U,
  boolean,
  Error | undefined,
];

export type UseConsoleNamespaceBookmarks = (
  cluster?: string,
) => ConsoleUserSettingHookResult<
  ConsoleBookmarks,
  (bookmarks: ConsoleBookmarks) => Promise<ConsoleBookmarks>
>;

export type UseConsoleClusterBookmarks = (
  cluster?: string,
) => ConsoleUserSettingHookResult<
  ConsoleBookmarks,
  (bookmarks: ConsoleBookmarks) => Promise<ConsoleBookmarks>
>;

export type UseConsoleShowSystemNamespaces = (
  cluster?: string,
) => ConsoleUserSettingHookResult<boolean, (showSystem: boolean) => Promise<boolean>>;

type ConsoleUserSettingsContext = {
  configMapName: null | string;
  userConfigMap: IoK8sApiCoreV1ConfigMap | undefined;
  userName: string | undefined;
};

export type UpsertConsoleUserSettingArgs = ConsoleUserSettingsContext & {
  cluster?: string;
  key: string;
  serializedValue: string;
};
