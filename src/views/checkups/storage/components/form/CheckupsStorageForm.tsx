import React, { useEffect, useMemo, useRef, useState } from 'react';
import CheckupImageField from 'src/views/checkups/components/CheckupImageField';

import { IoK8sApiStorageV1StorageClass } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { getDefaultStorageClass } from '@kubevirt-utils/components/DiskModal/components/StorageClassAndPreallocation/utils/helpers';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useRelatedImage from '@kubevirt-utils/hooks/useRelatedImage';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { generatePrettyName, isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  Popover,
  PopoverPosition,
  TextInput,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { storageCheckupImageSettings } from '../../utils/const';

import AdvancedSettings, { StorageCheckupAdvancedSettings } from './AdvancedSettings';
import CheckupsStorageFormActions from './CheckupsStorageFormActions';

import './checkups-storage-form.scss';

const CheckupsStorageForm = () => {
  const { t } = useKubevirtTranslation();
  const cluster = useClusterParam();
  const [name, setName] = useState<string>(generatePrettyName('kubevirt-storage-checkup'));
  const [timeOut, setTimeOut] = useState<string>('10');
  const [checkupImage, checkupImageLoaded, checkupImageLoadError] = useRelatedImage({
    ...storageCheckupImageSettings,
    cluster,
  });

  const [advancedSettings, setAdvancedSettings] = useState<StorageCheckupAdvancedSettings>({
    numOfVMs: '',
    skipTeardown: 'never',
    storageClass: '',
    vmiTimeout: '',
  });

  const [storageClasses, storageClassesLoaded, storageClassesError] = useK8sWatchData<
    IoK8sApiStorageV1StorageClass[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(StorageClassModel),
    isList: true,
  });

  const defaultSC = useMemo(() => getDefaultStorageClass(storageClasses ?? []), [storageClasses]);

  const hasAppliedDefaultSC = useRef(false);

  useEffect(() => {
    if (!hasAppliedDefaultSC.current && storageClassesLoaded && !isEmpty(defaultSC)) {
      setAdvancedSettings((prev) => ({ ...prev, storageClass: defaultSC?.metadata?.name }));
      hasAppliedDefaultSC.current = true;
    }
  }, [defaultSC, storageClassesLoaded]);

  return (
    <Grid>
      <GridItem span={6}>
        <Form className={'CheckupsStorageForm--main'}>
          <FormSection title={t('Run storage checkup')} titleElement="h1">
            {t(
              `Storage checkup validating storage is working correctly for VirtualMachines using the kiagnose engine.`,
            )}

            <FormGroup fieldId="name" isRequired label={t('Name')}>
              <TextInput
                id="name"
                isRequired
                name="name"
                onChange={(_event, value) => setName(value)}
                value={name}
              />
            </FormGroup>
            <FormGroup
              labelHelp={
                <Popover
                  bodyContent={t('How much time before the check will try to close itself')}
                  position={PopoverPosition.right}
                >
                  <Button icon={<HelpIcon />} variant={ButtonVariant.plain} />
                </Popover>
              }
              fieldId="timeout"
              isRequired
              label={t('Timeout (minutes)')}
            >
              <TextInput
                className="CheckupsStorageForm--main__number-input"
                id="timeout"
                isRequired
                name="timeout"
                onChange={(_event, val) => setTimeOut(val)}
                type="number"
                value={timeOut}
              />
            </FormGroup>
            {checkupImageLoadError && (
              <CheckupImageField
                checkupImage={checkupImage}
                checkupImageLoaded={checkupImageLoaded}
                checkupImageLoadError={checkupImageLoadError}
              />
            )}
            <AdvancedSettings
              defaultSC={defaultSC}
              setSettings={setAdvancedSettings}
              settings={advancedSettings}
              storageClasses={storageClasses}
              storageClassesError={storageClassesError}
              storageClassesLoaded={storageClassesLoaded}
            />
            <CheckupsStorageFormActions
              advancedSettings={{
                ...advancedSettings,
                storageClass: advancedSettings.storageClass || defaultSC?.metadata?.name,
              }}
              checkupImage={checkupImage}
              name={name}
              timeOut={timeOut}
            />
          </FormSection>
        </Form>
      </GridItem>
    </Grid>
  );
};

export default CheckupsStorageForm;
