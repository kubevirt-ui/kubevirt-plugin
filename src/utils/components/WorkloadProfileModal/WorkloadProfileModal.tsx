import * as React from 'react';

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
  initialWorkload: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workload: string) => Promise<K8sResourceCommon | void>;
};

const WorkloadProfileModal: React.FC<WorkloadProfileModalProps> = React.memo(
  ({ initialWorkload, isOpen, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const [workload, setWorkload] = React.useState<string>(initialWorkload || WORKLOADS.desktop);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>, value: WORKLOADS) => {
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
  },
);

export default WorkloadProfileModal;
