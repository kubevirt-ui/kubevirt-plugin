import * as React from 'react';
import { WorkloadProfileKeys, workloadProfiles } from 'src/views/templates/utils/constants';
import { getTemplateWorkload } from 'src/views/templates/utils/selectors';

import { V1Template } from '@kubevirt-ui/kubevirt-api/console';
import TabModal from '@kubevirt-utils/components/TabModal/TabModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { Form, FormGroup, Select, SelectOption } from '@patternfly/react-core';

import './cpu-memory-modal.scss';

type WorkloadProfileModalProps = {
  obj: V1Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workload: WorkloadProfileKeys) => Promise<void | K8sResourceCommon>;
};

const WorkloadProfileModal: React.FC<WorkloadProfileModalProps> = React.memo(
  ({ obj, isOpen, onClose, onSubmit }) => {
    const { t } = useKubevirtTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
    const [workload, setWorkload] = React.useState<WorkloadProfileKeys>(
      getTemplateWorkload(obj) || 'desktop',
    );

    const handleChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
      value: WorkloadProfileKeys,
    ) => {
      event.preventDefault();
      setWorkload(value);
      setIsDropdownOpen(false);
    };

    return (
      <TabModal
        headerText={t('Edit Workload profile')}
        isOpen={isOpen}
        obj={obj}
        onClose={onClose}
        onSubmit={() => onSubmit(workload)}
      >
        <Form>
          <FormGroup fieldId="template-firmware-bootloader" label={t('Workload profile')}>
            <Select
              isOpen={isDropdownOpen}
              menuAppendTo="parent"
              onToggle={setIsDropdownOpen}
              onSelect={handleChange}
              selections={workload}
            >
              {Object.entries(workloadProfiles).map(([key, value]) => (
                <SelectOption key={key} value={key}>
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
