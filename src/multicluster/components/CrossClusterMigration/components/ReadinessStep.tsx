import React, { FC, useMemo } from 'react';
import { Updater } from 'use-immer';

import { V1beta1NetworkMap, V1beta1Plan, V1beta1StorageMap } from '@kubev2v/types';
import { VirtualMachineModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import ReadinessStepBody from './ReadinessStepBody';

type ReadinessStepProps = {
  migrationPlan: V1beta1Plan;
  networkMap: V1beta1NetworkMap;
  setMigrationPlan: Updater<V1beta1Plan>;
  setNetworkMap: Updater<V1beta1NetworkMap>;
  setStorageMap: Updater<V1beta1StorageMap>;
  storageMap: V1beta1StorageMap;
  vms: V1VirtualMachine[];
};

const ReadinessStep: FC<ReadinessStepProps> = ({
  migrationPlan,
  networkMap,
  setMigrationPlan,
  setNetworkMap,
  setStorageMap,
  storageMap,
  vms,
}) => {
  const namespace = getNamespace(vms?.[0]);
  const cluster = getCluster(vms?.[0]);
  const identifiers = useMemo(
    () => vms?.map((vm) => `${getNamespace(vm)}/${getName(vm)}`) || [],
    [vms],
  );

  const [fetchedVMs, fetchedVMsLoaded, fetchedVMsError] = useK8sWatchData<V1VirtualMachine[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(VirtualMachineModel),
    isList: true,
    namespace,
  });

  const selectedFetchedVMs = useMemo(
    () => fetchedVMs?.filter((vm) => identifiers.includes(`${getNamespace(vm)}/${getName(vm)}`)),
    [identifiers, fetchedVMs],
  );

  return (
    <StateHandler error={fetchedVMsError} hasData={!isEmpty(fetchedVMs)} loaded={fetchedVMsLoaded}>
      <ReadinessStepBody
        migrationPlan={migrationPlan}
        networkMap={networkMap}
        setMigrationPlan={setMigrationPlan}
        setNetworkMap={setNetworkMap}
        setStorageMap={setStorageMap}
        storageMap={storageMap}
        vms={selectedFetchedVMs}
      />
    </StateHandler>
  );
};

export default ReadinessStep;
