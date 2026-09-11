import type { FC } from 'react';
import { useMemo } from 'react';

import type { V1beta1NetworkMap } from '@forklift-ui/types';
import { NetworkAttachmentDefinitionModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind } from '@kubevirt-utils/models';
import type { NetworkAttachmentDefinitionKind } from '@kubevirt-utils/resources/nad/types';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { FormGroup, Split, SplitItem, TextInput, Title } from '@patternfly/react-core';

import { POD_NETWORK_TYPE } from '../constants';
import { getNADNameAndNamespace } from '../utils';

import type { UseNetworkReadinessReturnType } from '../hooks/useNetworkReadiness';

type NetworkMappingProps = {
  changeNetworkMap: UseNetworkReadinessReturnType['changeNetworkMap'];
  nads: NetworkAttachmentDefinitionKind[];
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
                selectProps={{ id: `network-select-${map.source.name}` }}
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
