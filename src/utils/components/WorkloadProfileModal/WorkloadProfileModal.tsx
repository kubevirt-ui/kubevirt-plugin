import React, { ChangeEvent, FC, useState } from 'react';

import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  WORKLOADS,
  WORKLOADS_DESCRIPTIONS,
  WORKLOADS_LABELS,
} from '@kubevirt-utils/resources/template';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, Select, SelectOption } from '@patternfly/react-core';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [workload, setWorkload] = useState<WORKLOADS>(initialWorkload || WORKLOADS.desktop);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>, value: WORKLOADS) => {
    event.preventDefault();
    setWorkload(value);
    setIsDropdownOpen(false);
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
          <Select
            isOpen={isDropdownOpen}
            menuAppendTo="parent"
            onSelect={handleChange}
            onToggle={setIsDropdownOpen}
            selections={workload}
          >
            {Object.entries(WORKLOADS_LABELS).map(([key, value]) => (
              <SelectOption description={t(WORKLOADS_DESCRIPTIONS[key])} key={key} value={key}>
                {t(value)}
              </SelectOption>
            ))}
          </Select>
        </FormGroup>
      </Form>
    </TabModal>
  );
};

export default WorkloadProfileModal;
