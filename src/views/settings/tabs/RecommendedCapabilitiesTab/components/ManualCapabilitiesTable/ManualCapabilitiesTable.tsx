import React, { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';

import StateHandler from '@kubevirt-utils/components/StateHandler/StateHandler';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { DataView, DataViewTable } from '@patternfly/react-data-view';

import { useCapabilitiesData } from '../../context/useCapabilitiesData';
import { buildTreeRows } from '../CustomSelectionView/buildTreeRows';

import { getManualOperatorActions } from './manualOperatorActions';

const ManualCapabilitiesTable: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { detailsMap, getCapabilityInstallState, manualFeatures, resourcesLoaded } =
    useCapabilitiesData();

  const columns = useMemo(
    () => [
      { cell: t('Name') },
      { cell: t('Status') },
      { cell: '', props: { className: 'pf-v6-c-table__action' } },
    ],
    [t],
  );

  const treeRows = useMemo(
    () =>
      buildTreeRows({
        detailsMap,
        features: manualFeatures,
        getCapabilityInstallState,
        getOperatorActions: (_op, opDetails) => getManualOperatorActions(opDetails, navigate, t),
        navigate,
        t,
      }),
    [detailsMap, getCapabilityInstallState, manualFeatures, navigate, t],
  );

  return (
    <StateHandler hasData={!isEmpty(manualFeatures)} loaded={resourcesLoaded} showSkeletonLoading>
      <DataView>
        <DataViewTable
          aria-label={t('Additional recommended capabilities table')}
          columns={columns}
          isTreeTable
          rows={treeRows}
        />
      </DataView>
    </StateHandler>
  );
};

export default ManualCapabilitiesTable;
