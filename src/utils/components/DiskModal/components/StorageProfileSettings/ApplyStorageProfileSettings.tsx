import React, { FC, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom-v5-compat';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { documentationURL } from '@kubevirt-utils/constants/documentation';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useStorageProfileClaimPropertySets from '@kubevirt-utils/hooks/useStorageProfileClaimPropertySets';
import {
  Checkbox,
  Flex,
  FlexItem,
  FormGroup,
  PopoverPosition,
  Skeleton,
} from '@patternfly/react-core';

import { V1DiskFormState } from '../../utils/types';
import { DATAVOLUME_TEMPLATE_STORAGE } from '../utils/constants';

import AccessMode from './AccessMode';
import VolumeMode from './VolumeMode';

import './ApplyStorageProfileSettings.scss';

const ApplyStorageProfileSettings: FC = () => {
  const { t } = useKubevirtTranslation();
  const [allowAllModes, setAllowAllModes] = useState<boolean>(false);
  const { watch } = useFormContext<V1DiskFormState>();

  const [storage] = watch([DATAVOLUME_TEMPLATE_STORAGE]);
  const { storageClassName = '' } = storage ?? {};

  const { claimPropertySets, error, loaded } = useStorageProfileClaimPropertySets(storageClassName);

  if (!loaded) {
    return <Skeleton screenreaderText={t('Loading StorageProfile')} />;
  }

  if (loaded && error) {
    return <ErrorAlert error={error} />;
  }

  return (
    <>
      <FormGroup>
        <Flex>
          <FlexItem>
            <Checkbox
              id="allow-all-storage-profile-options"
              isChecked={allowAllModes}
              label={t('Enable options not recommended by StorageProfile')}
              onChange={(_, checked: boolean) => setAllowAllModes(checked)}
            />
          </FlexItem>
          <FlexItem>
            <HelpTextIcon
              bodyContent={
                <>
                  <Trans ns="plugin__kubevirt-plugin">
                    Refer to the
                    <Link target="_blank" to={documentationURL.STORAGE_PROFILES}>
                      {' '}
                      StorageProfile{' '}
                    </Link>
                    documentation for details.
                  </Trans>
                </>
              }
              position={PopoverPosition.right}
            />
          </FlexItem>
        </Flex>
      </FormGroup>
      <Flex
        className="ApplyStorageProfileSettings--volume-access-section"
        spaceItems={{ default: 'spaceItems3xl' }}
      >
        <FlexItem>
          <VolumeMode allowAllModes={allowAllModes} claimPropertySets={claimPropertySets ?? []} />
        </FlexItem>
        <FlexItem>
          <AccessMode allowAllModes={allowAllModes} claimPropertySets={claimPropertySets ?? []} />
        </FlexItem>
      </Flex>
    </>
  );
};

export default ApplyStorageProfileSettings;
