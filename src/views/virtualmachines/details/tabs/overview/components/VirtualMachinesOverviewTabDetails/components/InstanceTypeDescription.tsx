import React, { FC } from 'react';

import { ControllerRevisionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineInstancetypeModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstancetypeModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstanceTypeModelFromMatcher } from '@kubevirt-utils/resources/instancetype/helper';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getPreferenceMatcher } from '@kubevirt-utils/resources/vm';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

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
      <VirtualMachineDescriptionItem
        descriptionData={
          itMatcher ? (
            <ResourceLink
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={itMatcher.revisionName}
              namespace={includeNamespace && getNamespace(vm)}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-instance-type"
        descriptionHeader={t('InstanceType')}
      />
      <VirtualMachineDescriptionItem
        descriptionData={
          preferenceMatcher ? (
            <ResourceLink
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={preferenceMatcher.revisionName}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-preference"
        descriptionHeader={t('Preference')}
      />
    </>
  );
};

export default InstanceTypeDescription;
