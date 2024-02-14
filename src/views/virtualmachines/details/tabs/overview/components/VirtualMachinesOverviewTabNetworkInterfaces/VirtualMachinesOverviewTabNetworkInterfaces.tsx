import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';

import { createURL } from '../../utils/utils';

import useVirtualMachinesOverviewTabInterfacesColumns from './hooks/useVirtualMachinesOverviewTabInterfacesColumns';
import useVirtualMachinesOverviewTabInterfacesData from './hooks/useVirtualMachinesOverviewTabInterfacesData';
import { InterfacesData } from './utils/types';
import VirtualMachinesOverviewTabNetworkInterfacesRow from './VirtualMachinesOverviewTabNetworkInterfacesRow';

import './virtual-machines-overview-tab-interfaces.scss';

type VirtualMachinesOverviewTabInterfacesProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};
const VirtualMachinesOverviewTabInterfaces: FC<VirtualMachinesOverviewTabInterfacesProps> = ({
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const data = useVirtualMachinesOverviewTabInterfacesData(vm, vmi);
  const columns = useVirtualMachinesOverviewTabInterfacesColumns();

  return (
    <div className="VirtualMachinesOverviewTabInterfaces--main">
      <Card>
        <CardTitle className="text-muted">
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${VirtualMachineDetailsTab.Network}`,
              location?.pathname,
            )}
          >
            {t('Network interfaces ({{count}})', { count: data?.length || 0 })}
          </Link>
        </CardTitle>
        <Divider />
        <CardBody isFilled>
          <VirtualizedTable<InterfacesData>
            NoDataEmptyMsg={() => (
              <div className="pf-u-text-align-center no-data-empty-message">
                {t('No network interfaces found')}
              </div>
            )}
            columns={columns}
            data={data}
            loaded
            loadError={false}
            Row={VirtualMachinesOverviewTabNetworkInterfacesRow}
            unfilteredData={data}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default VirtualMachinesOverviewTabInterfaces;
