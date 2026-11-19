import { type NavigateFunction } from 'react-router';

export type PathScope = {
  cluster: string | undefined;
  namespace: string | undefined;
};

export type WidenUrlPathForToolbarFiltersResult = {
  scope: PathScope;
  shouldNavigate: boolean;
};

export type NavigateToWidenedVmListPathParams = {
  isACMPage: boolean;
  navigate: NavigateFunction;
  scope: PathScope;
  searchParams: URLSearchParams;
};
