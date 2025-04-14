import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import { UseInstanceTypeAndPreferencesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition } from '@patternfly/react-core';

import AddBootableVolumeLink from '../AddBootableVolumeLink/AddBootableVolumeLink';

type CreateFromInstanceTypeTitleProps = {
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
};

const CreateFromInstanceTypeTitle: FC<CreateFromInstanceTypeTitleProps> = ({
  instanceTypesAndPreferencesData,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <>
      {t('Select volume to boot from')}{' '}
      <HelpTextIcon
        bodyContent={(hide) => (
          <Trans ns="plugin__kubevirt-plugin" t={t}>
            <div>From the Volume table, select a bootable volume to boot your VirtualMachine.</div>
            <div>
              To add a bootable volume that is not listed, click{' '}
              <AddBootableVolumeLink
                hidePopover={hide}
                loadError={instanceTypesAndPreferencesData.loadError}
                text={t('Add volume.')}
              />
            </div>
            <div>
              Learn how to{' '}
              <Link to="/quickstart?quickstart=windows-bootsource-pipeline">
                create a bootable volume automatically by using pipelines
              </Link>
            </div>
          </Trans>
        )}
        className="create-vm-instance-type-section__HelpTextIcon"
        position={PopoverPosition.right}
      />
    </>
  );
};

export default CreateFromInstanceTypeTitle;
