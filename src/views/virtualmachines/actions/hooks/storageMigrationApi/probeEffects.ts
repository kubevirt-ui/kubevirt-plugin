import {
  MigPlanModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  type StorageMigrationAPI,
  MTC_MIGRATION_NAMESPACE,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sListItems } from '@multicluster/k8sRequests';

import {
  type StorageMigrationProbeFallbackPhase,
  csvLoadedIndicatesMultiNsStorageMigrationApi,
  STORAGE_MIGRATION_PROBE_PHASE_IDLE,
  STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404,
} from './constants';
import { STORAGE_MIGRATION_PROBE_MULTI_NS_LIST_NON_404_WARN } from './probeConstants';
import { isStorageMigrationResourceNotFound } from './probeHttpUtils';
import { handleStorageMigrationProbeListError } from './storageMigrationProbeListError';

type FinishProbe = (api: StorageMigrationAPI) => void;

export const probeSingleNsApiOrNone = (
  cluster: string | undefined,
  canceled: () => boolean,
  finish: FinishProbe,
): void => {
  kubevirtK8sListItems({
    cluster,
    model: VirtualMachineStorageMigrationPlanModel,
    queryParams: {},
  })
    .then(() => {
      finish(STORAGE_MIGRATION_API.SINGLE_NS);
    })
    .catch((singleNsError) => {
      handleStorageMigrationProbeListError(singleNsError, {
        canceled,
        onCrdPresentButListDenied: () => finish(STORAGE_MIGRATION_API.SINGLE_NS),
        onNotFound: () => finish(STORAGE_MIGRATION_API.NONE),
        onTransport: () => finish(STORAGE_MIGRATION_API.NONE),
      });
    });
};

export const probeMtcThenSingleNsOrNone = (
  cluster: string | undefined,
  canceled: () => boolean,
  finish: FinishProbe,
): void => {
  kubevirtK8sListItems({
    cluster,
    model: MigPlanModel,
    queryParams: { ns: MTC_MIGRATION_NAMESPACE },
  })
    .then(() => {
      finish(STORAGE_MIGRATION_API.MTC);
    })
    .catch((mtcError) => {
      handleStorageMigrationProbeListError(mtcError, {
        canceled,
        onCrdPresentButListDenied: () => finish(STORAGE_MIGRATION_API.MTC),
        onNotFound: () => probeSingleNsApiOrNone(cluster, canceled, finish),
        onTransport: () => probeSingleNsApiOrNone(cluster, canceled, finish),
      });
    });
};

type OnMultiNs404Args = {
  canceled: () => boolean;
  cluster: string | undefined;
  csvLoaded: boolean;
  csvVersion: string | undefined;
  finish: FinishProbe;
  phaseRef: { current: StorageMigrationProbeFallbackPhase };
  scheduleDelayedProbe: (run: () => void) => void;
};

export const onMultiNamespaceStorageMigration404 = ({
  canceled,
  cluster,
  csvLoaded,
  csvVersion,
  finish,
  phaseRef,
  scheduleDelayedProbe,
}: OnMultiNs404Args): void => {
  if (csvLoadedIndicatesMultiNsStorageMigrationApi(csvLoaded, csvVersion)) {
    finish(STORAGE_MIGRATION_API.MULTI_NS);
    return;
  }
  if (csvLoaded) {
    probeMtcThenSingleNsOrNone(cluster, canceled, finish);
    return;
  }
  phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404;
  scheduleDelayedProbe(() => {
    if (
      canceled() ||
      phaseRef.current !== STORAGE_MIGRATION_PROBE_PHASE_WAITING_CSV_AFTER_MULTI_NS_404
    )
      return;
    phaseRef.current = STORAGE_MIGRATION_PROBE_PHASE_IDLE;
    probeMtcThenSingleNsOrNone(cluster, canceled, finish);
  });
};

export const probeMultiNamespaceStorageMigrationApi = (
  cluster: string | undefined,
  canceled: () => boolean,
  finish: FinishProbe,
  on404: () => void,
): void => {
  kubevirtK8sListItems({
    cluster,
    model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    queryParams: {},
  })
    .then(() => {
      finish(STORAGE_MIGRATION_API.MULTI_NS);
    })
    .catch((error) => {
      if (canceled()) return;
      if (isStorageMigrationResourceNotFound(error)) {
        on404();
        return;
      }
      kubevirtConsole.warn(STORAGE_MIGRATION_PROBE_MULTI_NS_LIST_NON_404_WARN, {
        cluster,
        error: String(error),
      });
      probeSingleNsApiOrNone(cluster, canceled, finish);
    });
};
