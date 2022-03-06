import * as React from 'react';

import { NodeModel, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover, {
  getVMIIPAddresses,
} from '../../../../list/components/FirstItemListPopover/FirstItemListPopover';
import MutedTextDiv from '../components/MutedTextDiv/MutedTextDiv';

// import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMIPod } from './vmiHelper';

export type VirtualMachineDetailsRightGridLayoutPresentation = {
  pod: React.ReactNode;
  ipAddress: React.ReactNode;
  hostname: React.ReactNode;
  timezone: React.ReactNode;
  node: React.ReactNode;
  userCredentials: React.ReactNode;
  sshAccess: React.ReactNode;
};

export const getStoppedVMRightGridPresentation =
  (): VirtualMachineDetailsRightGridLayoutPresentation => {
    const notAvailable = <MutedTextDiv text="Not available" />;
    const virtualMachineIsNotRunning = <MutedTextDiv text="Virtual machine is not running" />;

    return {
      pod: notAvailable,
      ipAddress: virtualMachineIsNotRunning,
      hostname: notAvailable,
      timezone: virtualMachineIsNotRunning,
      node: notAvailable,
      userCredentials: virtualMachineIsNotRunning,
      sshAccess: virtualMachineIsNotRunning,
    };
  };

export const getRunningVMRightGridPresentation = (
  vmi: V1VirtualMachineInstance,
  pods: K8sResourceCommon[],
  guestAgentData?: V1VirtualMachineInstanceGuestAgentInfo,
  sshService?: any,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const vmiPod = getVMIPod(vmi, pods);
  const ipAddressess = getVMIIPAddresses(vmi);
  const nodeName = vmi?.status?.nodeName;
  const guestAgentIsRequired = guestAgentData && Object.keys(guestAgentData)?.length === 0;

  const sshNotAvailableText = <MutedTextDiv text="SSH service is not available" />;
  const guestAgentIsRequiredText = <MutedTextDiv text="Guest agent is required" />;
  console.log(sshService);
  return {
    pod: (
      <ResourceLink
        kind={PodModel.kind}
        name={vmiPod?.metadata?.name}
        namespace={vmiPod?.metadata?.namespace}
      />
    ),
    ipAddress: <FirstItemListPopover items={ipAddressess} headerContent={'IP Addresses'} />,
    hostname: guestAgentIsRequired ? guestAgentIsRequiredText : guestAgentData?.hostname,
    timezone: guestAgentIsRequired
      ? guestAgentIsRequiredText
      : guestAgentData?.timezone?.split(',')[0],
    node: <ResourceLink kind={NodeModel.kind} name={nodeName} />,
    userCredentials: sshNotAvailableText,
    sshAccess: sshNotAvailableText,
  };
};
