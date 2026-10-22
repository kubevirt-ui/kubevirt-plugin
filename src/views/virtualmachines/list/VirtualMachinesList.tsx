import { type FC, useMemo } from 'react';

import { tourGuideVM } from '@kubevirt-utils/components/GuidedTour/utils/constants';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { PageTitles } from '@kubevirt-utils/constants/page-constants';
import { DocumentTitle, ListPageBody } from '@openshift-console/dynamic-plugin-sdk';
import { useSignals } from '@preact/signals-react/runtime';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';

import VirtualMachinesListBody from './components/VirtualMachinesListBody';
import { useVMDataSource } from './hooks/useVMDataSource';
import useVMMetrics from './hooks/useVMMetrics';
import { filterVMsByClusterAndNamespace } from './utils/utils';

import './VirtualMachinesList.scss';

type VirtualMachinesListProps = { allVMsLoaded?: boolean; cluster?: string; namespace: string };

const VirtualMachinesList: FC<VirtualMachinesListProps> = ({
  allVMsLoaded,
  cluster,
  namespace,
}) => {
  useSignals();
  useVMMetrics();

  const { accessibleVMs, error, isSoftError, refresh, vms, vmsLoaded } = useVMDataSource(
    namespace,
    cluster,
  );
  const vmsToShow = useMemo(() => (runningTourSignal.value ? [tourGuideVM] : vms), [vms]);

  const allVMsInNamespace = useMemo(
    () => filterVMsByClusterAndNamespace(vmsSignal.value, namespace, cluster),
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [vmsSignal.value, namespace, cluster],
  );
  const hasNoVMs = !allVMsInNamespace.length;

  return (
    <>
      <DocumentTitle>{PageTitles.VirtualMachines}</DocumentTitle>
      <ListPageBody>
        <div className="vm-listpagebody">
          <VirtualMachinesListBody
            accessibleVMs={accessibleVMs}
            allVMsInNamespace={allVMsInNamespace}
            cluster={cluster}
            error={error}
            isSoftError={isSoftError}
            namespace={namespace}
            refresh={refresh}
            showEmptyState={Boolean(allVMsLoaded && hasNoVMs && !error)}
            vmsLoaded={vmsLoaded}
            vmsToShow={vmsToShow}
          />
        </div>
      </ListPageBody>
    </>
  );
};

export default VirtualMachinesList;
