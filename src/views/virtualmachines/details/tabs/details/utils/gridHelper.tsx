import * as React from 'react';
import { TFunction } from 'i18next';

import { NodeModel, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceGuestAgentInfo,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Loading from '@kubevirt-utils/components/Loading/Loading';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import SSHAccess from '@kubevirt-utils/components/SSHAccess/SSHAccess';
import UserCredentials from '@kubevirt-utils/components/UserCredentials/UserCredentials';
import { getVMIIPAddresses, getVMIPod } from '@kubevirt-utils/resources/vmi';
import {
  K8sResourceCommon,
  ResourceLink,
  WatchK8sResult,
} from '@openshift-console/dynamic-plugin-sdk';

import FirstItemListPopover from '../../../../list/components/FirstItemListPopover/FirstItemListPopover';

export type VirtualMachineDetailsRightGridLayoutPresentation = {
  pod: React.ReactNode;
  ipAddress: React.ReactNode;
  hostname: React.ReactNode;
  timezone: React.ReactNode;
  node: React.ReactNode;
  userCredentials: React.ReactNode;
  sshAccess: React.ReactNode;
};

export const getStoppedVMRightGridPresentation = (
  t: TFunction,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const NotAvailable = <MutedTextSpan text={t('Not available')} />;
  const VirtualMachineIsNotRunning = <MutedTextSpan text={t('Virtual machine is not running')} />;

  return {
    pod: NotAvailable,
    ipAddress: VirtualMachineIsNotRunning,
    hostname: NotAvailable,
    timezone: VirtualMachineIsNotRunning,
    node: NotAvailable,
    userCredentials: VirtualMachineIsNotRunning,
    sshAccess: VirtualMachineIsNotRunning,
  };
};

export const getRunningVMRightGridPresentation = (
  t: TFunction,
  vmi: V1VirtualMachineInstance,
  pods: K8sResourceCommon[],
  guestAgentData?: V1VirtualMachineInstanceGuestAgentInfo,
  watchSSHService?: WatchK8sResult<IoK8sApiCoreV1Service>,
): VirtualMachineDetailsRightGridLayoutPresentation => {
  const vmiPod = getVMIPod(vmi, pods);
  const ipAddresses = getVMIIPAddresses(vmi);
  const nodeName = vmi?.status?.nodeName;
  const guestAgentIsRequired = guestAgentData && Object.keys(guestAgentData)?.length === 0;

  const GuestAgentIsRequiredText = <MutedTextSpan text={t('Guest agent is required')} />;

  const [sshService, sshServiceLoaded, sshServiceError] = watchSSHService;

  return {
    pod: (
      <ResourceLink
        kind={PodModel.kind}
        name={vmiPod?.metadata?.name}
        namespace={vmiPod?.metadata?.namespace}
      />
    ),
    ipAddress: <FirstItemListPopover items={ipAddresses} headerContent={'IP Addresses'} />,
    hostname: guestAgentIsRequired ? GuestAgentIsRequiredText : guestAgentData?.hostname,
    timezone: guestAgentIsRequired
      ? GuestAgentIsRequiredText
      : guestAgentData?.timezone?.split(',')[0],
    node: <ResourceLink kind={NodeModel.kind} name={nodeName} />,
    userCredentials:
      sshServiceLoaded || sshServiceError ? (
        <UserCredentials vmi={vmi} sshService={sshService} />
      ) : (
        <Loading />
      ),
    sshAccess:
      sshServiceLoaded || sshServiceError ? <SSHAccess sshService={sshService} /> : <Loading />,
  };
};
