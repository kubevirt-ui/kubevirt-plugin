import { type FC, type MouseEvent, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  type WORKLOADS,
  WORKLOADS_DESCRIPTIONS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { getNoModalChangesTooltip } from '@kubevirt-utils/utils/text';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { FormGroup } from '@patternfly/react-core';
import { SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';

type WorkloadProfileModalProps = {
  initialWorkload: WORKLOADS | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workload: WORKLOADS) => Promise<K8sResourceCommon | void>;
};

const WorkloadProfileModal: FC<WorkloadProfileModalProps> = ({
  initialWorkload,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { t } = useKubevirtTranslation();
  const [workload, setWorkload] = useState<WORKLOADS | undefined>(initialWorkload);

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: WORKLOADS): void => {
    event.preventDefault();
    setWorkload(value);
  };

  return (
    <TabModal
      headerText={t('Edit workload profile')}
      isDisabled={!workload || workload === initialWorkload}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(workload)}
      shouldWrapInForm
      submitDisabledTooltip={
        !workload ? t('Select a workload profile') : getNoModalChangesTooltip(t)
      }
    >
      <FormGroup fieldId="template-firmware-bootloader" label={t('Workload profile')}>
        <FormPFSelect
          onSelect={handleChange}
          placeholder={t('Select workload profile')}
          selected={workload}
          selectedLabel={
            workload && WORKLOADS_LABELS[workload] ? t(WORKLOADS_LABELS[workload]) : undefined
          }
          toggleProps={{ isFullWidth: true }}
        >
          {Object.entries(WORKLOADS_LABELS).map(([key, value]) => (
            <SelectOption description={t(WORKLOADS_DESCRIPTIONS[key])} key={key} value={key}>
              {t(value)}
            </SelectOption>
          ))}
        </FormPFSelect>
      </FormGroup>
    </TabModal>
  );
};

export default WorkloadProfileModal;
