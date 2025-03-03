import React, { Dispatch, FC, SetStateAction } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { Content, ContentVariants, Stack, StackItem, Title } from '@patternfly/react-core';

type VirtualMachineMigrationDestinationTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  setSelectedStorageClass: Dispatch<SetStateAction<string>>;
  sortedStorageClasses: string[];
};

const StorageClassModelGroupVersionKind = modelToGroupVersionKind(StorageClassModel);

const VirtualMachineMigrationDestinationTab: FC<VirtualMachineMigrationDestinationTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  setSelectedStorageClass,
  sortedStorageClasses,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Destination StorageClass')}</Title>
        <Content component={ContentVariants.p}>
          {t('Select the destination storage for the VirtualMachine storage migration.')}
        </Content>
      </StackItem>
      <StackItem>
        <InlineFilterSelect
          options={sortedStorageClasses?.map((storageClass) => ({
            children: (
              <>
                <ResourceLink
                  groupVersionKind={StorageClassModelGroupVersionKind}
                  inline
                  linkTo={false}
                  name={storageClass}
                />
                {defaultStorageClassName === storageClass ? t('(default)') : ''}
              </>
            ),
            value: storageClass,
          }))}
          popperProps={{
            appendTo: () => document.getElementById('virtual-machine-migration-modal'),
          }}
          selected={destinationStorageClass}
          setSelected={setSelectedStorageClass}
          toggleProps={{ isFullWidth: true, placeholder: t('Select StorageClass') }}
        />
      </StackItem>
    </Stack>
  );
};

export default VirtualMachineMigrationDestinationTab;
