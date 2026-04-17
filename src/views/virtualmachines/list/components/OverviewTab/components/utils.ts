import { TFunction } from 'react-i18next';

type SpokeClusterParams = {
  cluster?: string;
  hubClusterName: string;
  isACMPage: boolean;
  isAllClustersPage: boolean;
  loaded: boolean;
};

type MCOWarningParams = {
  isACMPage: boolean;
  isAllClustersPage: boolean;
  isSpokeCluster: boolean;
  mcoInstalled: boolean;
  observabilityLoaded: boolean;
};

type ObservabilityWarningParams = {
  cluster?: string;
  disabledClusters: string[];
  isACMPage: boolean;
  isAllClustersPage: boolean;
  isSpokeCluster: boolean;
  mcoInstalled: boolean;
  observabilityError: unknown;
  observabilityLoaded: boolean;
};

export const CLUSTER_SEPARATOR = ',';

export type ObservabilityDisabledAlertProps = {
  disabledClusters: string[];
};

export const getIsSpokeCluster = ({
  cluster,
  hubClusterName,
  isACMPage,
  isAllClustersPage,
  loaded,
}: SpokeClusterParams): boolean =>
  isACMPage && loaded && !!cluster && cluster !== hubClusterName && !isAllClustersPage;

export const getShowMCOWarning = ({
  isACMPage,
  isAllClustersPage,
  isSpokeCluster,
  mcoInstalled,
  observabilityLoaded,
}: MCOWarningParams): boolean =>
  isACMPage && observabilityLoaded && !mcoInstalled && (isAllClustersPage || isSpokeCluster);

export const getShowObservabilityWarning = ({
  cluster,
  disabledClusters,
  isACMPage,
  isAllClustersPage,
  isSpokeCluster,
  mcoInstalled,
  observabilityError,
  observabilityLoaded,
}: ObservabilityWarningParams): boolean =>
  isACMPage &&
  mcoInstalled &&
  observabilityLoaded &&
  !observabilityError &&
  ((isAllClustersPage && disabledClusters.length > 0) ||
    (isSpokeCluster && disabledClusters.includes(cluster)));

export const getAlertMessage = (canCreate: boolean, t: TFunction) =>
  canCreate
    ? t('Create your first virtual machine to begin monitoring health and performance metrics.')
    : t('Health and performance metrics will appear after virtual machines are available.');
