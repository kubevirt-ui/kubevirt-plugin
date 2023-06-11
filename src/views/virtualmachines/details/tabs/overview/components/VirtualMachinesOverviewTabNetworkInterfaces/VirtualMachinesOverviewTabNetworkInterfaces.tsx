import React from 'react';
import { Link } from 'react-router-dom';

import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, Divider } from '@patternfly/react-core';
import { NETWORK } from '@virtualmachines/utils';

import { createURL } from '../../utils/utils';

import useVirtualMachinesOverviewTabInterfacesColumns from './hooks/useVirtualMachinesOverviewTabInterfacesColumns';
import useVirtualMachinesOverviewTabInterfacesData from './hooks/useVirtualMachinesOverviewTabInterfacesData';
import { InterfacesData } from './utils/types';
import VirtualMachinesOverviewTabNetworkInterfacesRow from './VirtualMachinesOverviewTabNetworkInterfacesRow';

import './virtual-machines-overview-tab-interfaces.scss';

const VirtualMachinesOverviewTabInterfaces = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const [data] = useVirtualMachinesOverviewTabInterfacesData(vm);
  const columns = useVirtualMachinesOverviewTabInterfacesColumns();

  return (
    <div className="VirtualMachinesOverviewTabInterfaces--main">
      <Card>
        <CardTitle className="text-muted">
          <Link
            to={createURL(
              `${VirtualMachineDetailsTab.Configurations}/${NETWORK}`,
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
