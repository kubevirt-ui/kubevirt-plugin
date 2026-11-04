import { type FC, useMemo } from 'react';

import { type V1beta1NetworkMap } from '@forklift-ui/types';
import { NetworkAttachmentDefinitionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type EnhancedSelectOptionProps } from '@kubevirt-utils/components/FilterSelect/utils/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { type NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { POD_NETWORK_TYPE } from '../constants';
import { getNetworkDestinationSelectValue, getNetworkMapRowId } from '../mappingDisplayUtils';
import { getNADNameAndNamespace } from '../utils';

import { type UseNetworkReadinessReturnType } from '../hooks/useNetworkReadiness';
import ResourceMappingPanel from './ResourceMappingPanel';

type NetworkMappingProps = {
  changeNetworkMap: UseNetworkReadinessReturnType['changeNetworkMap'];
  nads: NetworkAttachmentDefinitionKind[];
  networkMap: V1beta1NetworkMap;
};

const NetworkMapping: FC<NetworkMappingProps> = ({ changeNetworkMap, nads, networkMap }) => {
  const { t } = useKubevirtTranslation();

  const selectOptions = useMemo((): EnhancedSelectOptionProps[] => {
    const nadOptions = (nads || []).map((nad) => {
      const nadIdentifier = `${getNamespace(nad)}/${getName(nad)}`;
      return {
        children: nadIdentifier,
        groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
        value: nadIdentifier,
      };
    });

    return [
      {
        children: <div>{t('Pod network')}</div>,
        value: POD_NETWORK_TYPE,
      },
      ...nadOptions,
    ];
  }, [nads, t]);

  const rows = useMemo(
    () =>
      (networkMap?.spec?.map ?? []).map((map) => ({
        rowId: getNetworkMapRowId(map),
        selectedValue: getNetworkDestinationSelectValue(map),
        sourceValue:
          map.source.type === POD_NETWORK_TYPE ? t('Pod network') : (map.source.name ?? ''),
      })),
    [networkMap?.spec?.map, t],
  );

  return (
    <ResourceMappingPanel
      heading={t('Network mapping')}
      onSelect={(rowId, newSelection) => {
        if (newSelection === POD_NETWORK_TYPE) {
          changeNetworkMap(rowId, { type: POD_NETWORK_TYPE });
          return;
        }

        const { name, namespace } = getNADNameAndNamespace(newSelection);
        changeNetworkMap(rowId, { name, namespace, type: 'multus' });
      }}
      rows={rows}
      selectIdPrefix="network-select"
      selectOptions={selectOptions}
      sourceTermLabel={t('Source network')}
      targetTermLabel={t('Target network')}
      testIdPrefix="network-mapping"
    />
  );
};

export default NetworkMapping;
