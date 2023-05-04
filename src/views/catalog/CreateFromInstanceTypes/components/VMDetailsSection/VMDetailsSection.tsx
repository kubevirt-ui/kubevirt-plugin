import React, { FC, useState } from 'react';

import SSHSecretSection from '@kubevirt-utils/components/SSHSecretSection/SSHSecretSection';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ExpandableSection } from '@patternfly/react-core';

import VMDetailsBody from './components/VMDetailsBody/VMDetailsBody';

import './VMDetailsSection.scss';

const VMDetailsSection: FC = () => {
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
        <SSHSecretSection />
      </ExpandableSection>
      <VMDetailsBody />
    </div>
  );
};

export default VMDetailsSection;
