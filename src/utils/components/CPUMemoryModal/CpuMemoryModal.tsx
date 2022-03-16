import * as React from 'react';
import produce from 'immer';

import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
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
import { getCPUCount, getMemorySize, memorySizesTypes } from './utils/CpuMemoryUtils';

import './cpu-memory-modal.scss';

type CPUMemoryModalProps = {
  vm: V1VirtualMachine;
  isOpen: boolean;
  onClose: () => void;
};

const CPUMemoryModal: React.FC<CPUMemoryModalProps> = ({ vm, isOpen, onClose }) => {
  const { t } = useKubevirtTranslation();
  const {
    data: templateDefaultsData,
    loaded: defaultsLoaded,
    error: defaultLoadError,
  } = useTemplateDefaultCpuMemory(vm);
  const [updateInProcess, setUpdateInProcess] = React.useState<boolean>(false);
  const [updateError, setUpdateError] = React.useState<string>();

  const [memory, setMemory] = React.useState<number>();
  const [cpuCores, setCpuCores] = React.useState<number>();
  const [memoryUnit, setMemoryUnit] = React.useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  const resultVirtualMachine = React.useMemo(() => {
    const updatedVM = produce<V1VirtualMachine>(vm, (vmDraft: V1VirtualMachine) => {
      vmDraft.spec.template.spec.domain.resources.requests = {
        ...vm?.spec?.template?.spec?.domain?.resources?.requests,
        memory: `${memory}${memoryUnit}`,
      };
      vmDraft.spec.template.spec.domain.cpu.cores = cpuCores;
    });
    return updatedVM;
  }, [vm, memory, cpuCores, memoryUnit]);

  React.useEffect(() => {
    if (vm?.metadata) {
      const requests = vm?.spec?.template?.spec?.domain?.resources?.requests as {
        [key: string]: string;
      };
      const { size, unit } = getMemorySize(requests?.memory);
      setMemoryUnit(unit);
      setMemory(size);
      setCpuCores(getCPUCount(vm?.spec?.template?.spec?.domain?.cpu));
    }
  }, [vm]);

  const onSubmit = () => {
    setUpdateInProcess(true);

    k8sUpdate({
      model: VirtualMachineModel,
      data: resultVirtualMachine,
      ns: resultVirtualMachine.metadata.namespace,
      name: resultVirtualMachine.metadata.name,
    })
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
          onClick={onSubmit}
          isLoading={updateInProcess}
        >
          {t('Save')}
        </Button>,
        <Button
          key="default"
          variant={ButtonVariant.secondary}
          isDisabled={
            !defaultsLoaded ||
            !templateDefaultsData.defaultCpu ||
            !templateDefaultsData.defaultMemory ||
            defaultLoadError
          }
          isLoading={!defaultsLoaded}
          onClick={() => {
            setCpuCores(templateDefaultsData?.defaultCpu);
            setMemory(templateDefaultsData?.defaultMemory?.size);
            setMemoryUnit(templateDefaultsData?.defaultMemory?.unit);
          }}
        >
          {t('Restore default settings')}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      {vm?.status?.printableStatus === 'Running' && (
        <Alert variant="info" isInline title={t('Restart required to apply changes')}>
          {t(
            'If you make changes to the following settings you will need to restart the virtual machine in order for them to be applied',
          )}
        </Alert>
      )}
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPUs')}
          </Title>
          <NumberInput
            value={cpuCores}
            onMinus={() => setCpuCores((cpus) => +cpus - 1)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setMemory((mem) => (newNumber > 0 ? newNumber : mem));
            }}
            onPlus={() => setMemory((mem) => +mem + 1)}
            inputName="memory-input"
            min={1}
          />

          <Dropdown
            className="input-memory--dropdown"
            onSelect={(e: React.ChangeEvent<HTMLInputElement>) => {
              setMemoryUnit(e?.target?.innerText);
              setIsDropdownOpen(false);
            }}
            toggle={
              <DropdownToggle onToggle={(toggeld) => setIsDropdownOpen(toggeld)}>
                {memoryUnit}
              </DropdownToggle>
            }
            isOpen={isDropdownOpen}
            dropdownItems={memorySizesTypes.map((value) => {
              return (
                <DropdownItem key={value} component="button">
                  {value}
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
