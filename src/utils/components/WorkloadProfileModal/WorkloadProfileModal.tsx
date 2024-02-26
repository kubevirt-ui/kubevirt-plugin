import React, { FC, MouseEvent, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  WORKLOADS,
  WORKLOADS_DESCRIPTIONS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup } from '@patternfly/react-core';
import { SelectOption } from '@patternfly/react-core';

import FormPFSelect from '../FormPFSelect/FormPFSelect';

type WorkloadProfileModalProps = {
  initialWorkload: WORKLOADS;
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
  const [workload, setWorkload] = useState<WORKLOADS>(initialWorkload || WORKLOADS.desktop);

  const handleChange = (event: MouseEvent<HTMLSelectElement>, value: WORKLOADS) => {
    event.preventDefault();
    setWorkload(value);
  };

  return (
    <TabModal
      headerText={t('Edit workload profile')}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={() => onSubmit(workload)}
    >
      <Form>
        <FormGroup fieldId="template-firmware-bootloader" label={t('Workload profile')}>
          <FormPFSelect
            onSelect={handleChange}
            selected={workload}
            selectedLabel={WORKLOADS_LABELS[workload]}
            toggleProps={{ isFullWidth: true }}
          >
            {Object.entries(WORKLOADS_LABELS).map(([key, value]) => (
              <SelectOption description={t(WORKLOADS_DESCRIPTIONS[key])} key={key} value={key}>
                {value}
              </SelectOption>
            ))}
          </FormPFSelect>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default WorkloadProfileModal;
