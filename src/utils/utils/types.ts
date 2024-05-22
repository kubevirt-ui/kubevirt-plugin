import { Selector } from '@openshift-console/dynamic-plugin-sdk';

export type ItemsToFilterProps = {
  id: string;
  title: string;
};

export type ListPageProps = {
  fieldSelector?: string;
  hideColumnManagement?: boolean;
  hideNameLabelFilters?: boolean;
  hideTextFilter?: boolean;
  kind?: string;
  nameFilter?: string;
  namespace?: string;
  selector?: Selector;
  showTitle?: boolean;
};
