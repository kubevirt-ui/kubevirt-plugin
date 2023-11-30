import * as React from 'react';
import { getWorkloadProfile } from 'src/views/templates/utils/selectors';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import WorkloadProfileModal from '@kubevirt-utils/components/WorkloadProfileModal/WorkloadProfileModal';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  getTemplateWorkload,
  TEMPLATE_WORKLOAD_LABEL,
  WORKLOADS,
} from '@kubevirt-utils/resources/template';
import { getWorkload } from '@kubevirt-utils/resources/vm';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

const WorkloadProfile: React.FC<TemplateDetailsGridProps> = ({ editable, template }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const workload = getWorkloadProfile(template);

  const updateWorkload = (updatedWorkload: WORKLOADS) => {
    const vmObjectIndex = template?.objects.findIndex(
      (obj) => obj.kind === VirtualMachineModel.kind,
    );
    const hasWorkload = getWorkload(template?.objects?.[vmObjectIndex]);
    const workloadPath = `/objects/${vmObjectIndex}/spec/template/metadata/annotations/vm.kubevirt.io~1workload`;

    return k8sPatch({
      data: [
        {
          op: hasWorkload ? 'replace' : 'add',
          path: workloadPath,
          value: updatedWorkload,
        },
        {
          op: 'remove',
          path: `/metadata/labels/${TEMPLATE_WORKLOAD_LABEL}~1${getTemplateWorkload(template)}`,
        },
        {
          op: 'add',
          path: `/metadata/labels/${TEMPLATE_WORKLOAD_LABEL}~1${updatedWorkload}`,
          value: 'true',
        },
      ],
      model: TemplateModel,
      resource: template,
    });
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <WorkloadProfileModal
        initialWorkload={getTemplateWorkload(template) as WORKLOADS}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={updateWorkload}
      />
    ));

  return (
    <DescriptionListGroup>
      <DescriptionListTerm>{t('Workload profile')}</DescriptionListTerm>
      <DescriptionListDescription>
        {t(workload)}
        <Button isDisabled={!editable} isInline onClick={onEditClick} type="button" variant="link">
          <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
        </Button>
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default WorkloadProfile;
