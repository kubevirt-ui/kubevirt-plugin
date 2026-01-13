import React, { Dispatch, SetStateAction } from 'react';
import { TFunction } from 'react-i18next';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm';
import { Button } from '@patternfly/react-core';
import { DataViewTh, DataViewTr } from '@patternfly/react-data-view/dist/esm/DataViewTable';

import { ConfigurationDetails } from '../../../../../utils/types';
import EnactmentStateWithIcon from '../../../../EnactmentStateWithIcon';

export const getConfigurationRows = (
  configurationDetails: ConfigurationDetails[],
  setSelectedConfiguration: Dispatch<SetStateAction<ConfigurationDetails>>,
): DataViewTr[] =>
  configurationDetails.map((nncpDetail) => {
    const { configurationName, description, enactmentState, mtu, numNodes, uplink } = nncpDetail;

    return [
      {
        cell: (
          <Button onClick={() => setSelectedConfiguration(nncpDetail)} variant="link">
            {configurationName}
          </Button>
        ),
      },
      description || NO_DATA_DASH,
      uplink || NO_DATA_DASH,
      mtu || NO_DATA_DASH,
      numNodes || NO_DATA_DASH,
      {
        cell: enactmentState ? <EnactmentStateWithIcon status={enactmentState} /> : NO_DATA_DASH,
      },
    ];
  });

export const getConfigurationTableColumns = (t: TFunction): DataViewTh[] => {
  return [
    {
      cell: t('Configuration'),
      props: { sort: { columnIndex: 0, sortBy: {} } },
    },
    {
      cell: t('Description'),
      props: { sort: { columnIndex: 1, sortBy: {} } },
    },
    {
      cell: t('Uplink'),
      props: { sort: { columnIndex: 2, sortBy: {} } },
    },
    {
      cell: t('MTU'),
      props: {
        info: {
          tooltip: t(
            'The largest size of a data packet, in bytes, that can be transmitted across this network. It is critical that the entire underlying physical network infrastructure also supports the same or larger MTU size to avoid packet fragmentation and connectivity issues.',
          ),
        },
        sort: { columnIndex: 3, sortBy: {} },
      },
    },
    {
      cell: t('Nodes'),
      props: { sort: { columnIndex: 4, sortBy: {} } },
    },
    {
      cell: t('Enactment state'),
      props: { sort: { columnIndex: 5, sortBy: {} } },
    },
  ];
};
