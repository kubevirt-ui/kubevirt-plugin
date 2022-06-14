import * as React from 'react';
import { WorkloadProfileKeys } from 'src/views/templates/utils/constants';
import { getWorkloadProfile } from 'src/views/templates/utils/selectors';

import { TemplateModel } from '@kubevirt-ui/kubevirt-api/console';
import VirtualMachineModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineModel';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import { TemplateDetailsGridProps } from '../TemplateDetailsPage';

import WorkloadProfileModal from './WorkloadProfileModal';

const WorkloadProfile: React.FC<TemplateDetailsGridProps> = ({ template, editable }) => {
  const { createModal } = useModal();
  const { t } = useKubevirtTranslation();
  const workload = getWorkloadProfile(template);

  const updateWorkload = (updatedWorkload: WorkloadProfileKeys) => {
    const vmObjectIndex = template?.objects.findIndex(
      (obj) => obj.kind === VirtualMachineModel.kind,
    );
    const hasWorkload =
      template?.objects?.[vmObjectIndex]?.spec?.template?.metadata?.annotations?.[
        'vm.kubevirt.io/workload'
      ];
    const workloadPath = `/objects/${vmObjectIndex}/spec/template/metadata/annotations/vm.kubevirt.io~1workload`;

    return k8sPatch({
      model: TemplateModel,
      resource: template,
      data: [
        {
          op: hasWorkload ? 'replace' : 'add',
          path: workloadPath,
          value: updatedWorkload,
        },
      ],
    });
  };

  const onEditClick = () =>
    createModal(({ isOpen, onClose }) => (
      <WorkloadProfileModal
        obj={template}
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
        {editable && (
          <Button type="button" isInline onClick={onEditClick} variant="link">
            <PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />
          </Button>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

export default WorkloadProfile;
