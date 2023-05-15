import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { toIECUnit } from '@kubevirt-utils/utils/units';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import {
  Alert,
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
  Modal,
  ModalVariant,
  NumberInput,
  Title,
  TitleSizes,
} from '@patternfly/react-core';

import { ModalPendingChangesAlert } from '../PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { checkCPUMemoryChanged } from '../PendingChanges/utils/helpers';

import useTemplateDefaultCpuMemory from './hooks/useTemplateDefaultCpuMemory';
import { getCPUcores, getMemorySize, memorySizesTypes } from './utils/CpuMemoryUtils';
import { COMMON_TEMPLATE_DEFAULT_NAMESPACE } from './constants';

import './cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  vmi?: V1VirtualMachineInstance;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({ vm, isOpen, onClose, onSubmit, vmi }) => {
  const { t } = useKubevirtTranslation();
  const {
    data: templateDefaultsData,
    loaded: defaultsLoaded,
    error: defaultLoadError,
  } = useTemplateDefaultCpuMemory(
    vm?.metadata?.labels?.['vm.kubevirt.io/template'],
    vm?.metadata?.labels?.['vm.kubevirt.io/template.namespace'] ||
      COMMON_TEMPLATE_DEFAULT_NAMESPACE,
  );
  const [updateInProcess, setUpdateInProcess] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string>();

  const [memory, setMemory] = useState<number>();
  const [cpuCores, setCpuCores] = useState<number>();
  const [memoryUnit, setMemoryUnit] = useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const templateName = getLabel(vm, VM_TEMPLATE_ANNOTATION);

  const updatedVirtualMachine = useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      ensurePath(vmDraft, ['spec.template.spec.domain.resources', 'spec.template.spec.domain.cpu']);
      vmDraft.spec.template.spec.domain.resources.requests = {
        ...vm?.spec?.template?.spec?.domain?.resources?.requests,
        memory: `${memory}${memoryUnit}`,
      };
      vmDraft.spec.template.spec.domain.cpu.cores = cpuCores;
    });
    return updatedVM;
  }, [vm, memory, cpuCores, memoryUnit]);

  useEffect(() => {
    if (vm?.metadata) {
      const requests = vm?.spec?.template?.spec?.domain?.resources?.requests as {
        [key: string]: string;
      };
      const { size, unit } = getMemorySize(requests?.memory);
      setMemoryUnit(unit);
      setMemory(size);
      setCpuCores(getCPUcores(vm));
    }
  }, [vm]);

  const handleSubmit = () => {
    setUpdateInProcess(true);
    setUpdateError(null);

    onSubmit(updatedVirtualMachine)
      .then(() => {
        setUpdateInProcess(false);
        onClose();
      })
      .catch((err) => {
        setUpdateInProcess(false);
        setUpdateError(err.message);
      });
  };

  return (
    <Modal
      title={t('Edit CPU | Memory')}
      isOpen={isOpen}
      className="cpu-memory-modal"
      variant={ModalVariant.small}
      onClose={onClose}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={handleSubmit}
          isDisabled={updateInProcess}
          isLoading={updateInProcess}
        >
          {t('Save')}
        </Button>,
        <Button
          key="default"
          variant={ButtonVariant.secondary}
          isDisabled={
            !templateName ||
            !defaultsLoaded ||
            !templateDefaultsData?.defaultCpu ||
            !templateDefaultsData?.defaultMemory ||
            defaultLoadError
          }
          isLoading={templateName && !defaultsLoaded}
          onClick={() => {
            setCpuCores(templateDefaultsData?.defaultCpu);
            setMemory(templateDefaultsData?.defaultMemory?.size);
            setMemoryUnit(templateDefaultsData?.defaultMemory?.unit);
          }}
        >
          {t('Restore template settings')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      {vmi && (
        <ModalPendingChangesAlert isChanged={checkCPUMemoryChanged(updatedVirtualMachine, vmi)} />
      )}
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPU cores')}
          </Title>
          <NumberInput
            value={cpuCores}
            onMinus={() => setCpuCores((cpus) => +cpus - 1)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setCpuCores((cpus) => (newNumber > 0 ? newNumber : cpus));
            }}
            onPlus={() => setCpuCores((cpus) => +cpus + 1)}
            inputName="cpu-input"
            min={1}
          />
        </div>
        <div className="input-memory">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('Memory')}
          </Title>
          <NumberInput
            value={memory}
            onMinus={() => setMemory((mem) => +mem - 1)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setMemory((mem) => (newNumber > 0 ? newNumber : mem));
            }}
            onPlus={() => setMemory((mem) => +mem + 1)}
            inputName="memory-input"
            min={1}
          />

          <Dropdown
            className="input-memory--dropdown"
            onSelect={(e: ChangeEvent<HTMLInputElement>) => {
              setMemoryUnit(e?.target?.value);
              setIsDropdownOpen(false);
            }}
            toggle={
              <DropdownToggle onToggle={(toggeld) => setIsDropdownOpen(toggeld)}>
                {toIECUnit(memoryUnit)}
              </DropdownToggle>
            }
            isOpen={isDropdownOpen}
            dropdownItems={memorySizesTypes.map((value) => {
              return (
                <DropdownItem key={value} value={value} component="button">
                  {toIECUnit(value)}
                </DropdownItem>
              );
            })}
          />
        </div>
      </div>
      {updateError && (
        <Alert variant="danger" isInline title={t('Error')}>
          {updateError}
        </Alert>
      )}
    </Modal>
  );
};

export default CPUMemoryModal;
