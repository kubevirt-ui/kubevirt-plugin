import React, { Dispatch, FCC, SetStateAction } from 'react';

import InlineFilterSelect from '@kubevirt-utils/components/FilterSelect/InlineFilterSelect';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { POPPER_CONTAINER_ID } from '@kubevirt-utils/utils/constants';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Checkbox,
  Content,
  ContentVariants,
  Label,
  Popover,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type VirtualMachineMigrationDestinationTabProps = {
  defaultStorageClassName: string;
  destinationStorageClass: string;
  isSameStorageClass: boolean;
  keepOriginalVolumes: boolean;
  setKeepOriginalVolumes: Dispatch<SetStateAction<boolean>>;
  setSelectedStorageClass: Dispatch<SetStateAction<string>>;
  sortedStorageClasses: string[];
  vmStorageClassNames: string[];
};

const StorageClassModelGroupVersionKind = modelToGroupVersionKind(StorageClassModel);

const VirtualMachineMigrationDestinationTab: FCC<VirtualMachineMigrationDestinationTabProps> = ({
  defaultStorageClassName,
  destinationStorageClass,
  isSameStorageClass,
  keepOriginalVolumes,
  setKeepOriginalVolumes,
  setSelectedStorageClass,
  sortedStorageClasses,
  vmStorageClassNames,
}) => {
  const cluster = useClusterParam();
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h2">{t('Source and target StorageClass')}</Title>
        <Content component={ContentVariants.p}>{t('Source StorageClass (current):')}</Content>
        <div>
          {vmStorageClassNames.map((scName) => (
            <MulticlusterResourceLink
              cluster={cluster}
              groupVersionKind={StorageClassModelGroupVersionKind}
              inline
              key={scName}
              name={scName}
            />
          ))}
        </div>
      </StackItem>
      <StackItem>
        <Content component={ContentVariants.p}>
          {t('Select the target storage for the VirtualMachine storage migration.')}
        </Content>
        <InlineFilterSelect
          options={sortedStorageClasses?.map((storageClass) => ({
            children: (
              <>
                <MulticlusterResourceLink
                  cluster={cluster}
                  groupVersionKind={StorageClassModelGroupVersionKind}
                  inline
                  linkTo={false}
                  name={storageClass}
                />
                {vmStorageClassNames.includes(storageClass) && <Label>{t('current')}</Label>}{' '}
                {defaultStorageClassName === storageClass && <Label>{t('default')}</Label>}
              </>
            ),
            value: storageClass,
          }))}
          popperProps={{
            appendTo: () => document.getElementById(POPPER_CONTAINER_ID),
          }}
          selected={destinationStorageClass}
          setSelected={setSelectedStorageClass}
          toggleProps={{ isFullWidth: true, placeholder: t('Select StorageClass') }}
        />
      </StackItem>
      {isSameStorageClass && (
        <StackItem>
          <Alert
            title={t(
              'The selected target StorageClass is the same as the source. Select a different StorageClass to proceed with the migration.',
            )}
            isInline
            variant={AlertVariant.warning}
          />
        </StackItem>
      )}
      <StackItem>
        <Checkbox
          label={
            <>
              {t('Keep original volumes at source after successful migration')}{' '}
              <Popover
                bodyContent={t(
                  "The system is configured to decommission the source volumes once the migration is verified healthy to prevent 'zombie storage'. Check this if you want to manually verify and remove the old disks later.",
                )}
              >
                <Button hasNoPadding icon={<HelpIcon />} variant={ButtonVariant.plain} />
              </Popover>
            </>
          }
          id="keep-original-volumes"
          isChecked={keepOriginalVolumes}
          onChange={(_, checked) => setKeepOriginalVolumes(checked)}
        />
      </StackItem>
      <StackItem>
        {keepOriginalVolumes && (
          <Alert
            title={t(
              "If you keep these volumes, you'll need to manually decommission the disks after you've verified the migration",
            )}
            isInline
            variant={AlertVariant.info}
          />
        )}
      </StackItem>
    </Stack>
  );
};

export default VirtualMachineMigrationDestinationTab;
