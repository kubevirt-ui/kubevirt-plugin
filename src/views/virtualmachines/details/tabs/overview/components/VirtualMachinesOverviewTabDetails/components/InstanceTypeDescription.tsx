import React, { FC } from 'react';

import {
  modelToGroupVersionKind,
  VirtualMachineClusterPreferenceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';

type InstanceTypeDescriptionProps = {
  vm: V1VirtualMachine;
};

const InstanceTypeDescription: FC<InstanceTypeDescriptionProps> = ({ vm }) => {
  const { t } = useKubevirtTranslation();
  const None = <MutedTextSpan text={t('None')} />;

  const itMatcher = getInstanceTypeMatcher(vm);
  const itModel = getInstanceTypeModelFromMatcher(itMatcher);
  const includeNamespace = itModel === VirtualMachineInstancetypeModel;
  const preferenceMatcher = getPreferenceMatcher(vm);

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{t('InstanceType')}</DescriptionListTerm>
        <DescriptionListDescription data-test-id="virtual-machine-overview-details-instance-type">
          {itMatcher ? (
            <ResourceLink
              groupVersionKind={modelToGroupVersionKind(itModel)}
              name={itMatcher.name}
              namespace={includeNamespace && getNamespace(vm)}
            />
          ) : (
            None
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DescriptionListGroup>
        <DescriptionListTerm>{t('Preference')}</DescriptionListTerm>
        <DescriptionListDescription data-test-id="virtual-machine-overview-details-preference">
          {preferenceMatcher ? (
            <ResourceLink
              groupVersionKind={VirtualMachineClusterPreferenceModelGroupVersionKind}
              name={preferenceMatcher.name}
            />
          ) : (
            None
          )}
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};

export default InstanceTypeDescription;
