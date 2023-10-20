import React, { FC, useEffect, useState } from 'react';

import ExpandSectionWithSwitch from '@kubevirt-utils/components/ExpandSectionWithSwitch/ExpandSectionWithSwitch';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import {
  AUTOCOMPUTE_CPU_LIMITS_ENABLED,
  AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
} from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useHyperConvergeConfiguration from '@kubevirt-utils/hooks/useHyperConvergeConfiguration';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Alert, AlertVariant, Button, ButtonVariant } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { addLabelsToHyperConvergedCR } from './utils/utils';
import ProjectSelectorModal from './ProjectSelectorModal';

const AutoComputeCPULimits: FC = () => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();
  const [hco] = useHyperConvergeConfiguration();
  const [error, setError] = useState<Error>();
  const { featureEnabled: autoComputeCPUEnabled, toggleFeature: toggleCPULimits } = useFeatures(
    AUTOCOMPUTE_CPU_LIMITS_ENABLED,
  );
  const { featureEnabled: autoComputeCPUPreviewEnabled } = useFeatures(
    AUTOCOMPUTE_CPU_LIMITS_PREVIEW_ENABLED,
  );

  const handleSubmit = (idLabels: IDLabel[]) => {
    addLabelsToHyperConvergedCR(hco, idLabels).catch((err) => setError(err.message));
  };

  useEffect(() => {
    if (!autoComputeCPUPreviewEnabled) toggleCPULimits(false);
  }, [autoComputeCPUPreviewEnabled]);

  return (
    <>
      <ExpandSectionWithSwitch
        helpTextIconContent={t('Automatically compute CPU limits on projects containing labels')}
        isDisabled={!autoComputeCPUPreviewEnabled}
        switchIsOn={autoComputeCPUEnabled && autoComputeCPUPreviewEnabled}
        toggleContent={t('Auto-compute CPU limits')}
        turnOnSwitch={toggleCPULimits}
      >
        <div>
          {t('Project selector')}
          <Button
            onClick={() =>
              createModal((props) => (
                <ProjectSelectorModal
                  {...props}
                  labels={
                    hco?.spec?.resourceRequirements?.autoCPULimitNamespaceLabelSelector?.matchLabels
                  }
                  onSubmit={handleSubmit}
                />
              ))
            }
            isDisabled={!autoComputeCPUEnabled || !autoComputeCPUPreviewEnabled}
            isInline
            variant={ButtonVariant.link}
          >
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        </div>
        {error && (
          <Alert
            className="autocompute-cpu-limits__error-alert"
            isInline
            title={t('Error')}
            variant={AlertVariant.danger}
          >
            {error}
          </Alert>
        )}
      </ExpandSectionWithSwitch>
    </>
  );
};

export default AutoComputeCPULimits;
