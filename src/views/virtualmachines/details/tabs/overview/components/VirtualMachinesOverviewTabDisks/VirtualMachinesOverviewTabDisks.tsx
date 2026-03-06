import React, { FC, useMemo } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useDisksTableData from '@kubevirt-utils/resources/vm/hooks/disk/useDisksTableData';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

import { createURL } from '../../utils/utils';

import { getOverviewDiskRowId, getOverviewDisksColumns } from './overviewDisksDefinition';

import './virtual-machines-overview-tab-disks.scss';

type VirtualMachinesOverviewTabDisksProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabDisks: FC<VirtualMachinesOverviewTabDisksProps> = ({ vm, vmi }) => {
  const { t } = useKubevirtTranslation();
  const [disks, loaded, loadError] = useDisksTableData(vm, vmi);
  const columns = useMemo(() => getOverviewDisksColumns(t), [t]);

  return (
    <div className="VirtualMachinesOverviewTabDisks--main">
      <Card data-test="overview-disks-card">
        <CardTitle className="pf-v6-u-text-color-subtle">
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Storage}`,
              location?.pathname,
            )}
          >
            {t('Storage ({{disks}})', { disks: disks?.length ?? 0 })}
          </Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <div className="kubevirt-table--in-card">
            <KubevirtTable
              ariaLabel={t('Disks table')}
              columns={columns}
              data={disks}
              dataTest="overview-disks-table"
              getRowId={getOverviewDiskRowId}
              loaded={loaded}
              loadError={loadError}
              noDataEmptyText={t('No disks found')}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabDisks;
