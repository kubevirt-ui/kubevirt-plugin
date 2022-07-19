import * as React from 'react';
import { TFunction } from 'i18next';

import { NodeModel, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { VirtualMachineInstanceModelRef } from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { getVMIIPAddresses, getVMIPod } from '@kubevirt-utils/resources/vmi';
import { K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover from '../../../../list/components/FirstItemListPopover/FirstItemListPopover';

export type VirtualMachineDetailsRightGridLayoutPresentation = {
  pod: React.ReactNode;
  vmi: React.ReactNode;
  ipAddress: React.ReactNode;
  hostname: React.ReactNode;
  timezone: React.ReactNode;
  node: React.ReactNode;
};

export const getStoppedVMRightGridPresentation = (
  t: TFunction,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;
  const VirtualMachineIsNotRunning = <MutedTextSpan text={t('VirtualMachine is not running')} />;

  return {
    pod: NotAvailable,
    vmi: NotAvailable,
    ipAddress: VirtualMachineIsNotRunning,
    hostname: NotAvailable,
    timezone: VirtualMachineIsNotRunning,
    node: NotAvailable,
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

  const GuestAgentIsRequiredText = <MutedTextSpan text={t('Guest agent is required')} />;

  return {
    pod: (
      <ResourceLink
        kind={PodModel.kind}
        name={vmiPod?.metadata?.name}
        namespace={vmiPod?.metadata?.namespace}
      />
    ),
    vmi: (
      <ResourceLink
        kind={VirtualMachineInstanceModelRef}
        name={vmi?.metadata?.name}
        namespace={vmi?.metadata?.namespace}
      />
    ),
    ipAddress: <FirstItemListPopover items={ipAddresses} headerContent={'IP Addresses'} />,
    hostname: guestAgentIsRequired ? GuestAgentIsRequiredText : guestAgentData?.hostname,
    timezone: guestAgentIsRequired
      ? GuestAgentIsRequiredText
      : guestAgentData?.timezone?.split(',')[0],
    node: <ResourceLink kind={NodeModel.kind} name={nodeName} />,
  };
};
