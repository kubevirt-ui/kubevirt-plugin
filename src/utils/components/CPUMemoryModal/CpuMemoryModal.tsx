import * as React from 'react';

// import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
// import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
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

type FlavorModalProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUMemoryModal: React.FC<FlavorModalProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [showFlavorModal, setShowFlavorModal] = React.useState(true);
  const [data, loaded, error] = useTemplateDefaultCpuMemory(vmi);

  const [memory, setMemory] = React.useState<number>();
  const [cpu, setCpu] = React.useState<number>();
  const [memoryUnit, setMemoryUnit] = React.useState<string>();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (vmi?.metadata) {
      const requests = vmi?.spec?.domain?.resources?.requests as { [key: string]: string };
      const { size, unit } = getMemorySize(requests?.memory);
      setMemoryUnit(unit);
      setMemory(size);
      setCpu(getCPUCount(vmi?.spec?.domain?.cpu));
    }
  }, [vmi]);

  return (
    <Modal
      title={t('Edit CPU | Memory')}
      isOpen={showFlavorModal}
      className="cpu-memory-modal"
      variant={ModalVariant.small}
      onClose={() => setShowFlavorModal(false)}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.primary}
          onClick={() => {
            return null;
            // k8sUpdate<V1VirtualMachineInstance>({
            //   model: VirtualMachineInstanceModel,
            //   data: {
            //     ...vmi,
            //     spec: {
            //       ...vmi.spec,
            //       domain: {
            //         ...vmi.spec.domain,
            //         resources: {
            //           ...vmi.spec.domain.resources,
            //           requests: {
            //             ...vmi.spec.domain.resources.requests,
            //             memory: `${memory}${memoryUnit}`,
            //           },
            //         },
            //         cpu: {
            //           ...vmi.spec.domain.cpu,
            //           cores: cpu,
            //         },
            //       },
            //     },
            //   },
            // })
          }}
        >
          {t('Save')}
        </Button>,
        <Button
          key="default"
          variant={ButtonVariant.secondary}
          isDisabled={!loaded || !data.defaultCpu || !data.defaultMemory || error}
          isLoading={!loaded}
          onClick={() => {
            setCpu(data?.defaultCpu);
            setMemory(data?.defaultMemory?.size);
            setMemoryUnit(data?.defaultMemory?.unit);
          }}
        >
          {t('Restore default settings')}
        </Button>,
        <Button key="cancel" variant="link" onClick={() => setShowFlavorModal(false)}>
          {t('Cancel')}
        </Button>,
      ]}
    >
      <Alert variant="info" isInline title={t('Restart required to apply changes')}>
        {t(
          'If you make changes to the following settings you will need to restart the virtual machine in order for them to be applied',
        )}
      </Alert>
      <div className="inputs">
        <div className="input-cpu">
          <Title headingLevel="h6" size={TitleSizes.md}>
            {t('CPUs')}
          </Title>
          <NumberInput
            value={cpu}
            onMinus={() => setCpu((cpus) => +cpus - 1)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newNumber = +e?.target?.value;
              setCpu((cpus) => (newNumber > 0 ? newNumber : cpus));
            }}
            onPlus={() => setCpu((cpus) => +cpus + 1)}
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
    </Modal>
  );
};

export default CPUMemoryModal;
