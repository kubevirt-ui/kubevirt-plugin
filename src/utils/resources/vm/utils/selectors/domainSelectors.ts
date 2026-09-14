import {
  type V1AccessCredential,
  type V1Bootloader,
  type V1CPU,
  type V1Devices,
  type V1DomainSpec,
  type V1Features,
  type V1InstancetypeMatcher,
  type V1PreferenceMatcher,
  type V1VirtualMachine,
  type V1VirtualMachineCondition,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceSpec,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { DYNAMIC_CREDENTIALS_SUPPORT } from '@kubevirt-utils/components/DynamicSSHKeyInjection/constants/constants';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  getAnnotation,
  getLabel,
  getLabels,
  getStatusConditions as getResourceStatusConditions,
  getStatusConditionsByType as getResourceStatusConditionsByType,
} from '@kubevirt-utils/resources/shared';
import { type WORKLOADS } from '@kubevirt-utils/resources/template';
import { isVM } from '@kubevirt-utils/utils/typeGuards';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

import { VM_WORKLOAD_ANNOTATION } from '../annotations';
import {
  type RunStrategy,
  RUNSTRATEGY_ALWAYS,
  RUNSTRATEGY_HALTED,
  type UPDATE_STRATEGIES,
  type VirtualMachineStatusConditionTypes,
} from '../constants';
import { VM_STATUS } from '../vmStatus';

export const getFolder = (vm: V1VirtualMachine): string | undefined =>
  getLabels(vm)?.[VM_FOLDER_LABEL];

export const getNodeSelector = (
  vm: V1VirtualMachine,
): V1VirtualMachineInstanceSpec['nodeSelector'] => vm?.spec?.template?.spec?.nodeSelector;

export const getTolerations = (vm: V1VirtualMachine): V1VirtualMachineInstanceSpec['tolerations'] =>
  vm?.spec?.template?.spec?.tolerations;

export const getAffinity = (vm: V1VirtualMachine): V1VirtualMachineInstanceSpec['affinity'] =>
  vm?.spec?.template?.spec?.affinity;

export const getWorkload = (vm: V1VirtualMachine): WORKLOADS =>
  getAnnotation(vm?.spec?.template, VM_WORKLOAD_ANNOTATION) as WORKLOADS;

export const getAccessCredentials = (vm: V1VirtualMachine): V1AccessCredential[] | undefined =>
  vm?.spec?.template?.spec?.accessCredentials;

export const getIsDynamicSSHInjectionEnabled = (
  vm: V1VirtualMachine,
  bootableVolume?: BootableVolume,
): boolean =>
  getLabel(bootableVolume ?? vm, DYNAMIC_CREDENTIALS_SUPPORT) === 'true' &&
  Boolean(getAccessCredentials(vm)?.[0]?.sshPublicKey?.propagationMethod?.qemuGuestAgent);

export const getVMSSHSecretName = (vm: V1VirtualMachine): string | undefined =>
  getAccessCredentials(vm)?.find(
    (credential) => credential?.sshPublicKey?.source?.secret?.secretName,
  )?.sshPublicKey?.source?.secret?.secretName;

export const getAutoAttachPodInterface = (vm: V1VirtualMachine): boolean | undefined =>
  vm?.spec?.template?.spec?.domain?.devices?.autoattachPodInterface;

type DomainContainer = {
  spec?: {
    domain?: V1DomainSpec;
    template?: { spec?: { domain?: V1DomainSpec } };
  };
};

export const getDomain = (obj: DomainContainer): V1DomainSpec | undefined =>
  obj?.spec?.domain ?? obj?.spec?.template?.spec?.domain;

export const getMemory = <T extends DomainContainer>(obj: T): string | undefined =>
  getDomain(obj)?.memory?.guest?.toString() ??
  getDomain(obj)?.resources?.requests?.memory?.toString();

export const getCPU = <T extends DomainContainer>(obj: T): V1CPU | undefined => getDomain(obj)?.cpu;

export const getMemoryCPU = <T extends DomainContainer>(
  obj: T,
): { cpu: V1CPU | undefined; memory: string | undefined } => ({
  cpu: getCPU(obj),
  memory: getMemory(obj),
});

export const hasNUMAConfiguration = <T extends DomainContainer>(obj: T): boolean =>
  !!getCPU(obj)?.numa;

export const getCPUCores = <T extends DomainContainer>(obj: T): number => getCPU(obj)?.cores ?? 1;

export const getCPUSockets = <T extends DomainContainer>(obj: T): number =>
  getCPU(obj)?.sockets ?? 1;

export const getCPUThreads = <T extends DomainContainer>(obj: T): number =>
  getCPU(obj)?.threads ?? 1;

export const getEvictionStrategy = (vm: V1VirtualMachine): string | undefined =>
  vm?.spec?.template?.spec?.evictionStrategy;

export const getDevices = (vm: V1VirtualMachine): V1Devices | undefined =>
  vm?.spec?.template?.spec?.domain?.devices;

export const getDomainFeatures = (vm: V1VirtualMachine): V1Features | undefined =>
  vm?.spec?.template?.spec?.domain?.features;

export const getBootloader = (vm: V1VirtualMachine): V1Bootloader | undefined =>
  vm?.spec?.template?.spec?.domain?.firmware?.bootloader;

export const getHostname = (vm: V1VirtualMachine): string | undefined =>
  vm?.spec?.template?.spec?.hostname;

export const getInstanceTypeMatcher = (vm: V1VirtualMachine): V1InstancetypeMatcher | undefined =>
  vm?.spec?.instancetype;

export const getPreferenceMatcher = (vm: V1VirtualMachine): V1PreferenceMatcher | undefined =>
  vm?.spec?.preference;

export const getStatusConditions = (vm: V1VirtualMachine): V1VirtualMachineCondition[] =>
  getResourceStatusConditions<V1VirtualMachineCondition>(vm);

export const getStatusConditionByType = (
  vm: V1VirtualMachine,
  conditionType: VirtualMachineStatusConditionTypes,
): V1VirtualMachineCondition | undefined =>
  getResourceStatusConditionsByType<V1VirtualMachineCondition>(vm, conditionType);

export const getUpdateStrategy = (vm: V1VirtualMachine): UPDATE_STRATEGIES =>
  vm?.spec?.updateVolumesStrategy as UPDATE_STRATEGIES;

export const getRunStrategy = (vm: V1VirtualMachine): RunStrategy | undefined =>
  vm?.spec?.runStrategy as RunStrategy | undefined;

export const getVMRunning = (vm: V1VirtualMachine): boolean | undefined => vm?.spec?.running;

export const getEffectiveRunStrategy = (
  vm: undefined | V1VirtualMachine,
): RunStrategy | undefined => {
  if (vm?.spec?.runStrategy) return vm.spec.runStrategy as RunStrategy;
  if (vm?.spec?.running === true) return RUNSTRATEGY_ALWAYS;
  if (vm?.spec?.running === false) return RUNSTRATEGY_HALTED;
  return undefined;
};

export const isVMNotStopped = (vm: V1VirtualMachine): boolean =>
  Boolean(vm?.status?.printableStatus) && vm.status.printableStatus !== VM_STATUS.Stopped;

export const isHeadlessMode = (vm: V1VirtualMachine | V1VirtualMachineInstance): boolean => {
  const devices = isVM(vm) ? vm?.spec?.template?.spec?.domain?.devices : vm?.spec?.domain?.devices;
  return devices?.autoattachGraphicsDevice === false;
};

export const getArchitecture = (vm: V1VirtualMachine): string | undefined =>
  vm?.spec?.template?.spec?.architecture;

export const getVMTemplateAnnotations = (
  vm: V1VirtualMachine,
): { [key: string]: string } | undefined => vm?.spec?.template?.metadata?.annotations;
