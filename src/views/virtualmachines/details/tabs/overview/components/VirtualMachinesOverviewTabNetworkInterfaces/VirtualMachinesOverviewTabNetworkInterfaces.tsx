import React, { FCC, useMemo } from 'react';
import { Link } from 'react-router';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import KubevirtTable from '@kubevirt-utils/components/KubevirtTable/KubevirtTable';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useNamespaceUDN from '@kubevirt-utils/resources/udn/hooks/useNamespaceUDN';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

import { createURL } from '../../utils/utils';

import VirtualMachinesOverviewTabNetworkFQDN from './components/VirtualMachinesOverviewTabNetworkFQDN';
import useVirtualMachinesOverviewTabInterfacesData from './hooks/useVirtualMachinesOverviewTabInterfacesData';
import {
  getOverviewNetworkInterfaceRowId,
  getOverviewNetworkInterfacesColumns,
} from './overviewNetworkInterfacesDefinition';

import './virtual-machines-overview-tab-interfaces.scss';

type VirtualMachinesOverviewTabInterfacesProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const VirtualMachinesOverviewTabInterfaces: FCC<VirtualMachinesOverviewTabInterfacesProps> = ({
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const data = useVirtualMachinesOverviewTabInterfacesData(vm, vmi);
  const columns = useMemo(() => getOverviewNetworkInterfacesColumns(t), [t]);

  const [isNamespaceManagedByUDN] = useNamespaceUDN(getNamespace(vm));

  return (
    <div className="VirtualMachinesOverviewTabInterfaces--main">
      <Card data-test="overview-network-interfaces-card">
        <CardTitle className="pf-v6-u-text-color-subtle">
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
              location?.pathname,
            )}
          >
            {t('Network ({{count}})', { count: data?.length ?? 0 })}
          </Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <KubevirtTable
            ariaLabel={t('Network interfaces table')}
            className="kubevirt-table--in-card"
            columns={columns}
            data={data}
            dataTest="overview-network-interfaces-table"
            getRowId={getOverviewNetworkInterfaceRowId}
            loaded
            noDataMsg={t('No network interfaces found')}
          />
          {!isNamespaceManagedByUDN && <VirtualMachinesOverviewTabNetworkFQDN vm={vm} />}
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabInterfaces;
