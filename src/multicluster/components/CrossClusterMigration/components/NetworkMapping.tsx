import React, { FC, useMemo } from 'react';

import { V1beta1NetworkMap } from '@kubev2v/types';
import { NetworkAttachmentDefinitionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { NetworkAttachmentDefinition } from '@kubevirt-utils/components/NetworkInterfaceModal/components/hooks/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { FormGroup, Split, SplitItem, TextInput, Title } from '@patternfly/react-core';

import { POD_NETWORK_TYPE } from '../constants';
import { UseNetworkReadinessReturnType } from '../hooks/useNetworkReadiness';
import { getNADNameAndNamespace } from '../utils';

type NetworkMappingProps = {
  changeNetworkMap: UseNetworkReadinessReturnType['changeNetworkMap'];
  nads: NetworkAttachmentDefinition[];
  networkMap: V1beta1NetworkMap;
};

const NetworkMapping: FC<NetworkMappingProps> = ({ changeNetworkMap, nads, networkMap }) => {
  const { t } = useKubevirtTranslation();
  const nadsOptions = useMemo(
    () =>
      (nads || [])?.map((nad) => {
        const nadIdentifier = `${getNamespace(nad)}/${getName(nad)}`;
        return {
          children: nadIdentifier,
          groupVersionKind: modelToGroupVersionKind(NetworkAttachmentDefinitionModel),
          value: nadIdentifier,
        };
      }),
    [nads],
  );

  return (
    <div>
      <Title className="cross-cluster-migration-title" headingLevel="h5">
        {t('Network mapping')}
      </Title>
      {networkMap?.spec?.map?.map((map) => (
        <Split className="cross-cluster-migration-split" key={map.source.name}>
          <SplitItem isFilled>
            <FormGroup>
              <TextInput
                isDisabled
                value={map.source.type === POD_NETWORK_TYPE ? t('Pod network') : map.source.name}
              />
            </FormGroup>
          </SplitItem>
          <SplitItem isFilled>
            <FormGroup>
              <InlineFilterSelect
                options={[
                  {
                    children: <div>{t('Pod network')}</div>,
                    value: POD_NETWORK_TYPE,
                  },
                  ...nadsOptions,
                ]}
                selected={
                  map.destination.type === 'multus'
                    ? `${map.source.namespace}/${map.source.name}`
                    : POD_NETWORK_TYPE
                }
                setSelected={(newSelection) => {
                  if (newSelection === POD_NETWORK_TYPE) {
                    changeNetworkMap(map.source.name, {
                      type: POD_NETWORK_TYPE,
                    });
                    return;
                  }

                  const { name, namespace } = getNADNameAndNamespace(newSelection);

                  changeNetworkMap(map.source.name, {
                    name,
                    namespace,
                    type: 'multus',
                  });
                }}
                selectProps={{ id: `network-select-${map.source.name}` }}
                toggleProps={{ isFullWidth: true }}
              />
            </FormGroup>
          </SplitItem>
        </Split>
      ))}
    </div>
  );
};

export default NetworkMapping;
