import { type FC, useState } from 'react';
import { useController } from 'react-hook-form';

import DefaultStorageClassAlert from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeDestination/StorageClass/DefaultStorageClassAlert';
import StorageClassSelect from '@kubevirt-utils/components/AddBootableVolumeModal/components/VolumeDestination/StorageClass/StorageClassSelect';
import ApplyStorageProfileSettings from '@kubevirt-utils/components/ApplyStorageProfileSettings/ApplyStorageProfileSettings';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection, PopoverPosition } from '@patternfly/react-core';

import { useBootableVolumeWizardForm } from '../../../form/BootableVolumeWizardFormProvider';

const AdvancedStorageSettings: FC = () => {
  const { t } = useKubevirtTranslation();
  const { cluster, control } = useBootableVolumeWizardForm();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSCAlert, setShowSCAlert] = useState(false);

  const {
    field: { onChange: setStorageClassName, value: storageClassName },
  } = useController({ control, name: 'imageSource.storageClassName' });
  const {
    field: { onChange: setAccessMode, value: accessMode },
  } = useController({ control, name: 'imageSource.accessMode' });
  const {
    field: { onChange: setVolumeMode, value: volumeMode },
  } = useController({ control, name: 'imageSource.volumeMode' });

  return (
    <ExpandableSection
      isExpanded={isExpanded}
      isIndented
      onToggle={(_event, expanded) => setIsExpanded(expanded)}
      toggleText={t('Advanced storage settings')}
    >
      <StorageClassSelect
        cluster={cluster}
        labelHelp={
          <HelpTextIcon
            bodyContent={t('Uses the default storage class unless changed here.')}
            position={PopoverPosition.right}
          />
        }
        setShowSCAlert={setShowSCAlert}
        setStorageClassName={setStorageClassName}
        storageClass={storageClassName}
      />
      <div className="pf-v6-u-mt-lg">
        <ApplyStorageProfileSettings
          accessMode={accessMode}
          setAccessMode={setAccessMode}
          setVolumeMode={setVolumeMode}
          storageClassName={storageClassName}
          vmCluster={cluster}
          volumeMode={volumeMode}
        />
      </div>
      {showSCAlert && <DefaultStorageClassAlert />}
    </ExpandableSection>
  );
};

export default AdvancedStorageSettings;
