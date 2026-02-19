const YAML_TAB_HREF = 'yaml';

const isYamlTab = <T extends { href?: string }>(tab: T): boolean => tab.href === YAML_TAB_HREF;

export const filterYamlTabs = <T extends { href?: string; isHidden?: boolean }>(
  tabs: T[],
  hideYamlTab: boolean,
): T[] => {
  if (!hideYamlTab) return tabs;
  return tabs.map((tab) => (isYamlTab(tab) ? { ...tab, isHidden: true } : tab));
};

export const removeYamlTabs = <T extends { href?: string }>(
  tabs: T[],
  hideYamlTab: boolean,
): T[] => {
  if (!hideYamlTab) return tabs;
  return tabs.filter((tab) => !isYamlTab(tab));
};
