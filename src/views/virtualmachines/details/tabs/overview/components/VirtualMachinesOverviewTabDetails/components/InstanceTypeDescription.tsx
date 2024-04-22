import React, { FC } from 'react';

import { ControllerRevisionModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
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
  const preferenceMatcher = getPreferenceMatcher(vm);

  return (
    <>
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'A ControllerRevision resource is cloned from the InstanceType when creating the VirtualMachine',
        )}
        descriptionData={
          itMatcher ? (
            <ResourceLink
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={itMatcher.revisionName}
              namespace={getNamespace(vm)}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-instance-type"
        descriptionHeader={t('InstanceType')}
        isPopover
      />
      <VirtualMachineDescriptionItem
        bodyContent={t(
          'A ControllerRevision resource is cloned from the Preference when creating the VirtualMachine',
        )}
        descriptionData={
          preferenceMatcher ? (
            <ResourceLink
              groupVersionKind={ControllerRevisionModelGroupVersionKind}
              name={preferenceMatcher.revisionName}
              namespace={getNamespace(vm)}
            />
          ) : (
            None
          )
        }
        data-test-id="virtual-machine-overview-details-preference"
        descriptionHeader={t('Preference')}
        isPopover
      />
    </>
  );
};

export default InstanceTypeDescription;
