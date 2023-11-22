import * as React from 'react';
import { TFunction } from 'i18next';

import { NodeModel, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import GuestAgentIsRequiredText from '@kubevirt-utils/components/GuestAgentIsRequiredText/GuestAgentIsRequiredText';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { getVMIIPAddresses, getVMIPod } from '@kubevirt-utils/resources/vmi';
import { K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover from '../../../../list/components/FirstItemListPopover/FirstItemListPopover';

export type VirtualMachineDetailsRightGridLayoutPresentation = {
  hostname: React.ReactNode;
  ipAddress: React.ReactNode;
  node: React.ReactNode;
  pod: React.ReactNode;
  timezone: React.ReactNode;
  vmi: React.ReactNode;
};

export const getStoppedVMRightGridPresentation = (
  t: TFunction,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;
  const VirtualMachineIsNotRunning = <MutedTextSpan text={t('VirtualMachine is not running')} />;

  return {
    hostname: NotAvailable,
    ipAddress: VirtualMachineIsNotRunning,
    node: NotAvailable,
    pod: NotAvailable,
    timezone: VirtualMachineIsNotRunning,
    vmi: NotAvailable,
  };
};

export const getRunningVMRightGridPresentation = (
  t: TFunction,
  vmi: V1VirtualMachineInstance,
  pods: K8sResourceCommon[],
  guestAgentData?: V1VirtualMachineInstanceGuestAgentInfo,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const vmiPod = getVMIPod(vmi, pods);
  const ipAddresses = getVMIIPAddresses(vmi);
  const nodeName = vmi?.status?.nodeName;
  const guestAgentIsRequired = guestAgentData && Object.keys(guestAgentData)?.length === 0;

  const guestAgentIsRequiredText = <GuestAgentIsRequiredText vmi={vmi} />;

  return {
    hostname: guestAgentIsRequired ? guestAgentIsRequiredText : guestAgentData?.hostname,
    ipAddress: <FirstItemListPopover headerContent={'IP addresses'} items={ipAddresses} />,
    node: <ResourceLink kind={NodeModel.kind} name={nodeName} />,
    pod: (
      <ResourceLink
        kind={PodModel.kind}
        name={vmiPod?.metadata?.name}
        namespace={vmiPod?.metadata?.namespace}
      />
    ),
    timezone: guestAgentIsRequired
      ? guestAgentIsRequiredText
      : guestAgentData?.timezone?.split(',')[0],
    vmi: (
      <ResourceLink
        kind={VirtualMachineInstanceModelRef}
        name={vmi?.metadata?.name}
        namespace={vmi?.metadata?.namespace}
      />
    ),
  };
};
