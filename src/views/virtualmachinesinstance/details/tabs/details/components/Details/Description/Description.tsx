import * as React from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import MutedTextDiv from '@kubevirt-utils/components/MutedTextDiv/MutedTextDiv';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { Button, DescriptionListDescription, DescriptionListTerm } from '@patternfly/react-core';
import { PencilAltIcon } from '@patternfly/react-icons';

import './description.scss';

type DescriptionProps = {
  vmi: V1VirtualMachineInstance;
};

const Description: React.FC<DescriptionProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const [descriptionModalOpen, setDescriptionModalOpen] = React.useState(false);

  return (
    <>
      <DescriptionListTerm>{t('Description')}</DescriptionListTerm>
      <DescriptionListDescription>
        <Button
          isInline
          onClick={() => setDescriptionModalOpen(true)}
          variant="link"
          icon={<PencilAltIcon className="co-icon-space-l pf-c-button-icon--plain" />}
          iconPosition={'right'}
          className="Description--edit-button"
        >
          {vmi?.metadata?.annotations?.description ?? <MutedTextDiv text={t('Not available')} />}
        </Button>
        <DescriptionModal
          obj={vmi}
          isOpen={descriptionModalOpen}
          onClose={() => setDescriptionModalOpen(false)}
          onSubmit={(description) =>
            k8sPatch({
              model: VirtualMachineInstanceModel,
              resource: vmi,
              data: [
                {
                  op: 'replace',
                  path: '/metadata/annotations/description',
                  value: description,
                },
              ],
            })
          }
        />
      </DescriptionListDescription>
    </>
  );
};

export default Description;
