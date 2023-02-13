import React, { Dispatch, SetStateAction, useState } from 'react';

import { SSHSecretCredentials } from '@catalog/CreateFromInstanceTypes/components/VMDetailsSection/components/SSHKeySection/utils/types';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { InstanceTypeState } from '../../utils/constants';

import SSHKeySection from './components/SSHKeySection/SSHKeySection';
import VMDetailsBody from './components/VMDetailsBody/VMDetailsBody';

import './VMDetailsSection.scss';

type VMDetailsSectionProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  namespace: string;
  bootSource: V1beta1DataSource;
  instancetype: InstanceTypeState;
  sshSecretCredentials: SSHSecretCredentials;
  setSSHSecretCredentials: Dispatch<SetStateAction<SSHSecretCredentials>>;
};

const VMDetailsSection: React.FC<VMDetailsSectionProps> = ({
  vmName,
  setVMName,
  bootSource,
  instancetype,
  namespace,
  sshSecretCredentials,
  setSSHSecretCredentials,
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
        <SSHKeySection
          vmName={vmName}
          sshSecretCredentials={sshSecretCredentials}
          setSSHSecretCredentials={setSSHSecretCredentials}
        />
      </ExpandableSection>
      <VMDetailsBody
        vmName={vmName}
        setVMName={setVMName}
        namespace={namespace}
        bootSource={bootSource}
        instancetype={instancetype}
      />
    </div>
  );
};

export default VMDetailsSection;
