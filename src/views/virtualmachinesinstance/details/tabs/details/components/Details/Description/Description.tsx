import * as React from 'react';

import VirtualMachineInstanceModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineInstanceModel';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DescriptionModal } from '@kubevirt-utils/components/DescriptionModal/DescriptionModal';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import VirtualMachineDescriptionItem from '@kubevirt-utils/components/VirtualMachineDescriptionItem/VirtualMachineDescriptionItem';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import './description.scss';

type DescriptionProps = {
  vmi: V1VirtualMachineInstance;
};

const Description: React.FC<DescriptionProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { createModal } = useModal();

  return (
    <VirtualMachineDescriptionItem
      descriptionData={
        vmi?.metadata?.annotations?.description ?? <MutedTextSpan text={t('Not available')} />
      }
      onEditClick={() =>
        createModal((props) => (
          <DescriptionModal
            obj={vmi}
            {...props}
            onSubmit={(description) =>
              k8sPatch({
                data: [
                  {
                    op: 'replace',
                    path: '/metadata/annotations/description',
                    value: description,
                  },
                ],
                model: VirtualMachineInstanceModel,
                resource: vmi,
              })
            }
          />
        ))
      }
      descriptionHeader={t('Description')}
      isEdit
    />
  );
};

export default Description;
