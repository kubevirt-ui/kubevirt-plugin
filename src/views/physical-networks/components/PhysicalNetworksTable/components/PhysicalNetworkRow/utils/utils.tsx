import React from 'react';
import { TFunction } from 'react-i18next';

import { NODE_NETWORK_CONFIGURATION_WIZARD_PATH } from '../../../../../utils/constants';

import { PHYSICAL_NETWORK_NAME_PARAM_KEY } from './constants';
import { PhysicalNetworksRowActions } from './types';

export const getRowActions = (
  t: TFunction,
  history,
  networkName: string,
): PhysicalNetworksRowActions => [
  {
    onClick: () =>
      history.push(
        `${NODE_NETWORK_CONFIGURATION_WIZARD_PATH}&${PHYSICAL_NETWORK_NAME_PARAM_KEY}=${encodeURIComponent(
          networkName,
        )}`,
      ),
    title: (
      <div>
        <div className="pf-v6-c-menu__item-main">{t('Configure Nodes')}</div>
        <div className="pf-v6-c-menu__item-description">
          {t('Expand this network to a new set of Nodes.')}
        </div>
      </div>
    ),
  },
  {
    onClick: () =>
      history.push(
        `k8s/cluster/virtualmachine-networks/~new?${PHYSICAL_NETWORK_NAME_PARAM_KEY}=${encodeURIComponent(
          networkName,
        )}`,
      ),
    title: (
      <>
        <div className="pf-v6-c-menu__item-main">
          {t('Create a virtual machines network using this physical network')}
        </div>
        <div className="pf-v6-c-menu__item-description">
          {t('Creates an OVN Localnet network. Additional configuration required.')}
        </div>
      </>
    ),
  },
];
