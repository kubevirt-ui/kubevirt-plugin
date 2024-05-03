import React, { FC } from 'react';
import { Trans } from 'react-i18next';

import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import AddBootableVolumeLink from '../AddBootableVolumeLink/AddBootableVolumeLink';

type CreateFromInstanceTypeTitleProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const CreateFromInstanceTypeTitle: FC<CreateFromInstanceTypeTitleProps> = ({
  instanceTypesAndPreferencesData,
}) => {
  const { t } = useKubevirtTranslation();

  // TODO: Turn ExternalLink into quick start launcher link
  return (
    <>
      {t('Select volume to boot from')}{' '}
      <Popover
        bodyContent={(hide) => (
          <>
            <Trans ns="plugin__kubevirt-plugin" t={t}>
              <div>
                From the Volume table, select DataSources and PersistentVolumeClaims to boot your
                VirtualMachine.
              </div>
              <div>
                To add a bootable volume that is not listed, click{' '}
                <AddBootableVolumeLink
                  hidePopover={hide}
                  loadError={instanceTypesAndPreferencesData.loadError}
                  text={t('Add Volume.')}
                />
              </div>
              <div>
                Learn how to{' '}
                <ExternalLink
                  href=""
                  text="create a bootable volume automatically by using Pipelines"
                />
              </div>
            </Trans>
          </>
        )}
        className="create-vm-instance-type-section__HelpTextIcon"
        position={PopoverPosition.right}
      >
        <HelpIcon className="help-icon__cursor" />
      </Popover>
    </>
  );
};

export default CreateFromInstanceTypeTitle;
