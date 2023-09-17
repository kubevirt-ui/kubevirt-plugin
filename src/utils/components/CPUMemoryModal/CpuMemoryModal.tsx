import React, { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ModalPendingChangesAlert from '@kubevirt-utils/components/PendingChanges/ModalPendingChangesAlert/ModalPendingChangesAlert';
import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { getCPUcores, getMemory, VM_TEMPLATE_ANNOTATION } from '@kubevirt-utils/resources/vm';
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

import useTemplateDefaultCpuMemory from './hooks/useTemplateDefaultCpuMemory';
import { getMemorySize, memorySizesTypes } from './utils/CpuMemoryUtils';

import './cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (updatedVM: V1VirtualMachine) => Promise<V1VirtualMachine | void>;
  templateNamespace?: string;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const CPUMemoryModal: FC<CPUMemoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  templateNamespace = DEFAULT_NAMESPACE,
  vm,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const {
    data: templateDefaultsData,
    error: defaultLoadError,
    loaded: defaultsLoaded,
  } = useTemplateDefaultCpuMemory(
    vm?.metadata?.labels?.['vm.kubevirt.io/template'],
    vm?.metadata?.labels?.['vm.kubevirt.io/template.namespace'] || templateNamespace,
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
      ensurePath(vmDraft, [
        'spec.template.spec.domain.cpu',
        'spec.template.spec.domain.memory.guest',
      ]);

      vmDraft.spec.template.spec.domain.cpu.cores = cpuCores;
      vmDraft.spec.template.spec.domain.memory.guest = `${memory}${memoryUnit}`;
    });

    return updatedVM;
  }, [vm, memory, cpuCores, memoryUnit]);

  useEffect(() => {
    if (vm?.metadata) {
      const { size, unit } = getMemorySize(getMemory(vm));
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
      actions={[
        <Button
          isDisabled={updateInProcess}
          isLoading={updateInProcess}
          key="confirm"
          onClick={handleSubmit}
          variant={ButtonVariant.primary}
        >
          {t('Save')}
        </Button>,
        <Button
          isDisabled={
            !templateName ||
            !defaultsLoaded ||
            !templateDefaultsData?.defaultCpu ||
            !templateDefaultsData?.defaultMemory ||
            defaultLoadError
          }
          onClick={() => {
            setCpuCores(templateDefaultsData?.defaultCpu);
            setMemory(templateDefaultsData?.defaultMemory?.size);
            setMemoryUnit(templateDefaultsData?.defaultMemory?.unit);
          }}
          isLoading={templateName && !defaultsLoaded}
          key="default"
          variant={ButtonVariant.secondary}
        >
          {t('Restore template settings')}
        </Button>,
        <Button key="cancel" onClick={onClose} variant="link">
          {t('Cancel')}
        </Button>,
      ]}
      className="cpu-memory-modal"
      isOpen={isOpen}
      onClose={onClose}
      title={t('Edit CPU | Memory')}
      variant={ModalVariant.small}
    >
      {vmi && <ModalPendingChangesAlert />}
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPU cores')}
          </Title>
          <NumberInput
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setCpuCores((cpus) => (newNumber > 0 ? newNumber : cpus));
            }}
            inputName="cpu-input"
            min={1}
            onMinus={() => setCpuCores((cpus) => +cpus - 1)}
            onPlus={() => setCpuCores((cpus) => +cpus + 1)}
            value={cpuCores}
          />
        </div>
        <div className="input-memory">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('Memory')}
          </Title>
          <NumberInput
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setMemory((mem) => (newNumber > 0 ? newNumber : mem));
            }}
            inputName="memory-input"
            min={1}
            onMinus={() => setMemory((mem) => +mem - 1)}
            onPlus={() => setMemory((mem) => +mem + 1)}
            value={memory}
          />

          <Dropdown
            dropdownItems={memorySizesTypes.map((value) => {
              return (
                <DropdownItem component="button" key={value} value={value}>
                  {toIECUnit(value)}
                </DropdownItem>
              );
            })}
            onSelect={(e: ChangeEvent<HTMLInputElement>) => {
              setMemoryUnit(e?.target?.value);
              setIsDropdownOpen(false);
            }}
            toggle={
              <DropdownToggle onToggle={(toggeld) => setIsDropdownOpen(toggeld)}>
                {toIECUnit(memoryUnit)}
              </DropdownToggle>
            }
            className="input-memory--dropdown"
            isOpen={isDropdownOpen}
          />
        </div>
      </div>
      {updateError && (
        <Alert isInline title={t('Error')} variant="danger">
          {updateError}
        </Alert>
      )}
    </Modal>
  );
};

export default CPUMemoryModal;
