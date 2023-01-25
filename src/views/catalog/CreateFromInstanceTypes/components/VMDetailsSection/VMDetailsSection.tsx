import React, { Dispatch, SetStateAction, useState } from 'react';

import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import { InstanceTypeState } from '../../utils/constants';

import VMDetailsBody from './components/VMDetailsBody/VMDetailsBody';

import './VMDetailsSection.scss';

type VMDetailsSectionProps = {
  vmName: string;
  setVMName: Dispatch<SetStateAction<string>>;
  namespace: string;
  bootSource: V1beta1DataSource;
  instancetype: InstanceTypeState;
};

const VMDetailsSection: React.FC<VMDetailsSectionProps> = ({
  vmName,
  setVMName,
  bootSource,
  instancetype,
  namespace,
}) => {
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState<boolean>(false);

  return (
    <div className="instancetypes-vm-details-section">
      <ExpandableSection
        toggleText={t('Advanced')}
        data-test-id="expandable-advanced-section"
        onToggle={() => setAdvancedSectionOpen(!advancedSectionOpen)}
        isExpanded={advancedSectionOpen}
        isIndented
      >
        Placeholder for SSH section
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
