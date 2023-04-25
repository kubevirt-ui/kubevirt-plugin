import React, { Dispatch, SetStateAction, useState } from 'react';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import SSHSecretSection from '@kubevirt-utils/components/SSHSecretSection/SSHSecretSection';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { BootableVolume, InstanceTypeState } from '../../utils/constants';

import VMDetailsBody from './components/VMDetailsBody/VMDetailsBody';

import './VMDetailsSection.scss';

type VMDetailsSectionProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  namespace: string;
  bootSource: BootableVolume;
  instancetype: InstanceTypeState;
  sshSecretCredentials: SSHSecretCredentials;
  setSSHSecretCredentials: Dispatch<SetStateAction<SSHSecretCredentials>>;
  pvcSource: V1alpha1PersistentVolumeClaim;
};

const VMDetailsSection: React.FC<VMDetailsSectionProps> = ({
  vmName,
  setVMName,
  bootSource,
  instancetype,
  namespace,
  sshSecretCredentials,
  setSSHSecretCredentials,
  pvcSource,
}) => {
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState<boolean>(false);

  return (
    <div className="instancetypes-vm-details-section">
      <ExpandableSection
        toggleText={t('Advanced settings')}
        data-test-id="expandable-advanced-section"
        onToggle={() => setAdvancedSectionOpen(!advancedSectionOpen)}
        isExpanded={advancedSectionOpen}
        isIndented
      >
        <SSHSecretSection
          sshSecretDetails={sshSecretCredentials}
          setSSHSecretDetails={setSSHSecretCredentials}
        />
      </ExpandableSection>
      <VMDetailsBody
        vmName={vmName}
        setVMName={setVMName}
        namespace={namespace}
        bootSource={bootSource}
        instancetype={instancetype}
        pvcSource={pvcSource}
        sshSecretCredentials={sshSecretCredentials}
      />
    </div>
  );
};

export default VMDetailsSection;
