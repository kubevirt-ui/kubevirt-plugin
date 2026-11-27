import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import DefaultNetworkErrorAlert from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/DefaultNetworkErrorAlert/DefaultNetworkErrorAlert';
import SelectInstanceTypeSection from '@virtualmachines/wizard/steps/InstanceTypesSteps/ComputeResourcesStep/components/SelectInstanceTypeSection/SelectInstanceTypeSection';

type ComputeResourcesStepProps = {
  defaultNadError?: Error;
  defaultNadName?: string;
  project?: string;
};

const ComputeResourcesStep: FC<ComputeResourcesStepProps> = ({
  defaultNadError,
  defaultNadName,
  project,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Compute resources')}
        </Title>
      </StackItem>
      {defaultNadError && (
        <StackItem>
          <DefaultNetworkErrorAlert
            defaultNadError={defaultNadError}
            defaultNadName={defaultNadName}
            project={project}
          />
        </StackItem>
      )}
      <StackItem>{t('Define resources by selecting series and size.')}</StackItem>
      <StackItem>
        <SelectInstanceTypeSection />
      </StackItem>
    </Stack>
  );
};

export default ComputeResourcesStep;
