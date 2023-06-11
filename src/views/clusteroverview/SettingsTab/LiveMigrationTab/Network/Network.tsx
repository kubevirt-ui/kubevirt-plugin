import React, { useEffect, useState } from 'react';

import { NetworkAttachmentDefinitionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import {
  Alert,
  AlertVariant,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Skeleton,
  Text,
  TextVariants,
  Title,
} from '@patternfly/react-core';

import { NetworkAttachmentDefinitionKind } from '../../../OverviewTab/inventory-card/utils/types';
import {
  getLiveMigrationNetwork,
  PRIMARY_NETWORK,
  updateLiveMigrationConfig,
} from '../utils/utils';

const Network = ({ hyperConverge }) => {
  const { t } = useKubevirtTranslation();
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [nads, nadsLoading, nadsError] = useK8sWatchResource<NetworkAttachmentDefinitionKind[]>({
    groupVersionKind: NetworkAttachmentDefinitionModelGroupVersionKind,
    isList: true,
  });
  useEffect(() => {
    if (hyperConverge) {
      const network = getLiveMigrationNetwork(hyperConverge);
      setSelectedNetwork(network ?? PRIMARY_NETWORK);
    }
  }, [hyperConverge]);

  return (
    <>
      <Text component={TextVariants.small}>{t('Set live migration network')}</Text>
      <Title className="live-migration-tab__network--title" headingLevel="h6" size="md">
        {t('Live migration network')}
      </Title>
      {!isEmpty(nads) && nadsLoading ? (
        <Select
          onSelect={(_event: React.ChangeEvent<Element>, selectedValue: string) => {
            setIsSelectOpen(false);
            updateLiveMigrationConfig(
              hyperConverge,
              selectedValue !== PRIMARY_NETWORK ? selectedValue : null,
              'network',
            );
            setSelectedNetwork(selectedValue);
          }}
          isGrouped
          isOpen={isSelectOpen}
          onToggle={() => setIsSelectOpen(!isSelectOpen)}
          selections={selectedNetwork}
          variant={SelectVariant.single}
          width={360}
        >
          <SelectOption key="primary" value={t('Primary live migration network')} />
          <SelectGroup key="nad" label={t('Secondary NAD networks')}>
            {nads?.map((nad) => (
              <SelectOption key={nad?.metadata?.name} value={nad?.metadata?.name} />
            ))}
          </SelectGroup>
        </Select>
      ) : (
        !nadsError && <Skeleton width={'360px'} />
      )}
      {nadsError && (
        <Alert
          className="live-migration-tab--error"
          isInline
          title={t('Error')}
          variant={AlertVariant.danger}
        >
          {nadsError?.message}
        </Alert>
      )}
    </>
  );
};

export default Network;
